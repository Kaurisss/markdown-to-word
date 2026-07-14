export type WorkspaceErrorCode =
  | 'invalid-path'
  | 'outside-workspace'
  | 'unsupported-file'
  | 'not-found'
  | 'permission-denied'
  | 'conflict'
  | 'io-error';

export class WorkspaceError extends Error {
  readonly code: WorkspaceErrorCode;
  readonly cause?: unknown;

  constructor(code: WorkspaceErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'WorkspaceError';
    this.code = code;
    this.cause = cause;
  }
}