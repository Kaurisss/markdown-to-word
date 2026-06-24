// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RemoteModelDialog } from '@/components/ai/RemoteModelDialog';
import React from 'react';

describe('RemoteModelDialog', () => {
  const defaultProps = {
    show: true,
    isClosing: false,
    onClose: vi.fn(),
    providerName: 'Test Provider',
    loading: false,
    error: null as string | null,
    remoteModels: [],
    existingModelIds: [],
    search: '',
    onSearchChange: vi.fn(),
    onRefresh: vi.fn(),
    onAddOne: vi.fn(),
    onAddAll: vi.fn(),
  };

  it('should render loading state', () => {
    render(<RemoteModelDialog {...defaultProps} loading={true} />);
    expect(screen.getByText('加载中...')).toBeTruthy();
  });

  it('should render error state', () => {
    render(<RemoteModelDialog {...defaultProps} error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeTruthy();
  });

  it('should filter models by search and allow adding one', () => {
    const onAddOne = vi.fn();
    render(
      <RemoteModelDialog
        {...defaultProps}
        remoteModels={[{ id: 'gpt-3' }, { id: 'gpt-4' }]}
        search="4"
        onAddOne={onAddOne}
      />
    );
    
    expect(screen.queryByText('gpt-3')).toBeNull();
    expect(screen.getByText('gpt-4')).toBeTruthy();

    const addButton = screen.getByLabelText('添加模型');
    fireEvent.click(addButton);
    expect(onAddOne).toHaveBeenCalledWith('gpt-4');
  });

  it('should show remove button for existing models', () => {
    const onRemoveOne = vi.fn();
    render(
      <RemoteModelDialog
        {...defaultProps}
        remoteModels={[{ id: 'gpt-3' }]}
        existingModelIds={['gpt-3']}
        onRemoveOne={onRemoveOne}
      />
    );
    
    const removeButton = screen.getByLabelText('移除模型');
    fireEvent.click(removeButton);
    expect(onRemoveOne).toHaveBeenCalledWith('gpt-3');
  });

  it('should call onAddAll with filtered models that are not existing', () => {
    const onAddAll = vi.fn();
    render(
      <RemoteModelDialog
        {...defaultProps}
        remoteModels={[{ id: 'gpt-3' }, { id: 'gpt-4' }]}
        existingModelIds={['gpt-3']}
        onAddAll={onAddAll}
      />
    );
    
    const addAllButton = screen.getByText('添加全部 (1)');
    fireEvent.click(addAllButton);
    expect(onAddAll).toHaveBeenCalledWith([{ id: 'gpt-4' }]);
  });

  it('should call onRefresh when clicking refresh', () => {
    const onRefresh = vi.fn();
    render(
      <RemoteModelDialog
        {...defaultProps}
        onRefresh={onRefresh}
      />
    );
    
    const refreshButton = screen.getByText('重新获取');
    fireEvent.click(refreshButton);
    expect(onRefresh).toHaveBeenCalled();
  });
});
