import { WorkspaceError } from './workspaceErrors';

interface ParsedPath {
  root: string;
  segments: string[];
  windows: boolean;
}

function splitNormalizedPath(path: string): ParsedPath {
  const value = path.replace(/\\/g, '/');
  const driveMatch = value.match(/^([A-Za-z]:)(?:\/|$)/);

  if (driveMatch) {
    return {
      root: driveMatch[1],
      segments: normalizeSegments(value.slice(driveMatch[0].length).split('/'), true),
      windows: true,
    };
  }

  if (value.startsWith('//')) {
    const parts = value.slice(2).split('/').filter(Boolean);
    if (parts.length < 2) {
      throw new WorkspaceError('invalid-path', `无效的 UNC 路径：${path}`);
    }

    return {
      root: `//${parts[0]}/${parts[1]}`,
      segments: normalizeSegments(parts.slice(2), true),
      windows: true,
    };
  }

  if (value.startsWith('/')) {
    return {
      root: '/',
      segments: normalizeSegments(value.slice(1).split('/'), true),
      windows: false,
    };
  }

  return {
    root: '',
    segments: normalizeSegments(value.split('/'), false),
    windows: false,
  };
}

function normalizeSegments(segments: string[], absolute: boolean): string[] {
  const normalized: string[] = [];

  for (const segment of segments) {
    if (!segment || segment === '.') continue;

    if (segment === '..') {
      if (normalized.length > 0 && normalized.at(-1) !== '..') {
        normalized.pop();
      } else if (!absolute) {
        normalized.push(segment);
      }
      continue;
    }

    normalized.push(segment);
  }

  return normalized;
}

function formatPath(path: ParsedPath): string {
  if (path.root === '/') {
    return `/${path.segments.join('/')}` || '/';
  }

  if (path.root.startsWith('//')) {
    return path.segments.length > 0 ? `${path.root}/${path.segments.join('/')}` : path.root;
  }

  if (path.root) {
    return path.segments.length > 0 ? `${path.root}/${path.segments.join('/')}` : `${path.root}/`;
  }

  return path.segments.join('/');
}

function comparable(value: string, windows: boolean): string {
  return windows ? value.toLocaleLowerCase('en-US') : value;
}

function assertSameRoot(left: ParsedPath, right: ParsedPath): void {
  if (comparable(left.root, left.windows) !== comparable(right.root, right.windows)) {
    throw new WorkspaceError('outside-workspace', '目标路径与工作区不在同一文件系统根目录');
  }
}

export function isAbsolutePath(path: string): boolean {
  return /^(?:[A-Za-z]:[\\/]|\\\\|\/)/.test(path);
}

export function normalizeAbsolutePath(path: string): string {
  const parsed = splitNormalizedPath(path.trim());
  if (!parsed.root) {
    throw new WorkspaceError('invalid-path', `需要绝对路径：${path}`);
  }
  return formatPath(parsed);
}

export function normalizeRelativePath(path: string): string {
  if (isAbsolutePath(path)) {
    throw new WorkspaceError('invalid-path', `需要相对路径：${path}`);
  }

  const parsed = splitNormalizedPath(path.trim());
  if (parsed.segments.some((segment) => segment === '..')) {
    throw new WorkspaceError('outside-workspace', `路径越出工作区：${path}`);
  }

  return formatPath(parsed);
}

export function getParentPath(path: string): string {
  const parsed = splitNormalizedPath(path);
  parsed.segments.pop();
  return formatPath(parsed);
}

export function getBaseName(path: string): string {
  const parsed = splitNormalizedPath(path);
  return parsed.segments.at(-1) ?? parsed.root;
}

export function joinWorkspacePath(workspaceRoot: string, relativePath: string): string {
  const root = splitNormalizedPath(normalizeAbsolutePath(workspaceRoot));
  const relative = normalizeRelativePath(relativePath);
  const target = {
    ...root,
    segments: [...root.segments, ...splitNormalizedPath(relative).segments],
  };
  return formatPath(target);
}

export function isPathWithinWorkspace(workspaceRoot: string, targetPath: string): boolean {
  const root = splitNormalizedPath(normalizeAbsolutePath(workspaceRoot));
  const target = splitNormalizedPath(normalizeAbsolutePath(targetPath));

  if (comparable(root.root, root.windows) !== comparable(target.root, target.windows)) {
    return false;
  }

  return root.segments.every((segment, index) => (
    comparable(segment, root.windows) === comparable(target.segments[index] ?? '', target.windows)
  ));
}

export function assertPathWithinWorkspace(workspaceRoot: string, targetPath: string): string {
  const normalized = normalizeAbsolutePath(targetPath);
  if (!isPathWithinWorkspace(workspaceRoot, normalized)) {
    throw new WorkspaceError('outside-workspace', `拒绝访问工作区外路径：${targetPath}`);
  }
  return normalized;
}

export function getWorkspaceRelativePath(workspaceRoot: string, targetPath: string): string {
  const root = splitNormalizedPath(normalizeAbsolutePath(workspaceRoot));
  const target = splitNormalizedPath(assertPathWithinWorkspace(workspaceRoot, targetPath));
  assertSameRoot(root, target);
  return target.segments.slice(root.segments.length).join('/');
}

export function getRelativePath(fromDirectory: string, targetPath: string): string {
  const from = splitNormalizedPath(normalizeAbsolutePath(fromDirectory));
  const target = splitNormalizedPath(normalizeAbsolutePath(targetPath));
  assertSameRoot(from, target);

  const windows = from.windows || target.windows;
  let commonLength = 0;
  while (
    commonLength < from.segments.length
    && commonLength < target.segments.length
    && comparable(from.segments[commonLength], windows) === comparable(target.segments[commonLength], windows)
  ) {
    commonLength += 1;
  }

  const relativeSegments = [
    ...Array.from({ length: from.segments.length - commonLength }, () => '..'),
    ...target.segments.slice(commonLength),
  ];

  return relativeSegments.join('/') || '.';
}

export function naturalCompare(left: string, right: string): number {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}