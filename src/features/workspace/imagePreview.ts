import { getImageMimeType } from './fileFilters';
import type { WorkspaceFsAdapter } from './workspaceFs';

export interface ImagePreviewState {
  url: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  error: string | null;
}

export async function createImagePreviewUrl(
  fs: WorkspaceFsAdapter,
  path: string,
): Promise<{ url: string; size: number }> {
  const mimeType = getImageMimeType(path);
  if (!mimeType) throw new Error('不支持的图片格式');
  const bytes = await fs.readBinaryAsset(path);
  const blob = new Blob([bytes], { type: mimeType });
  return { url: URL.createObjectURL(blob), size: bytes.byteLength };
}

export function releaseImagePreviewUrl(url: string | null): void {
  if (url) URL.revokeObjectURL(url);
}

export function readImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('图片无法读取'));
    image.src = url;
  });
}