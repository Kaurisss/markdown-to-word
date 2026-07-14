import { afterEach, describe, expect, it, vi } from 'vitest';
import { startWorkspaceWatcher } from '@/features/workspace/workspaceWatcher';

describe('workspace watcher', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces changes into affected parent directories and ignores metadata', async () => {
    vi.useFakeTimers();
    let emit: ((event: { paths: string[] }) => void) | undefined;
    const onChange = vi.fn();
    const unwatch = vi.fn();
    const watcher = await startWorkspaceWatcher({
      workspaceRoot: 'C:\\work\\docs',
      onChange,
      debounceMs: 300,
      subscribe: async (_path, callback) => {
        emit = callback;
        return unwatch;
      },
    });

    emit?.({
      paths: [
        'C:\\work\\docs\\chapters\\one.md',
        'C:\\work\\docs\\chapters\\two.md',
        'C:\\work\\docs\\.md2word\\workspace.json',
      ],
    });
    emit?.({ paths: ['C:\\work\\docs\\images\\cover.png'] });

    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toEqual([
      'C:/work/docs/chapters',
      'C:/work/docs/images',
    ]);

    await watcher.stop();
    expect(unwatch).toHaveBeenCalledOnce();
  });

  it('does not emit a pending event after stop', async () => {
    vi.useFakeTimers();
    let emit: ((event: { paths: string[] }) => void) | undefined;
    const onChange = vi.fn();
    const watcher = await startWorkspaceWatcher({
      workspaceRoot: 'C:\\work\\docs',
      onChange,
      subscribe: async (_path, callback) => {
        emit = callback;
        return vi.fn();
      },
    });

    emit?.({ paths: ['C:\\work\\docs\\one.md'] });
    await watcher.stop();
    vi.runAllTimers();

    expect(onChange).not.toHaveBeenCalled();
  });
});