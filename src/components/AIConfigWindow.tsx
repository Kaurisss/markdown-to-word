import React, { useState, useEffect, useCallback } from 'react';
import { Copy2Line, CheckLine, LoadingLine, AddLine, PlayLine, Delete2Line, Edit2Line, Eye2Line, EyeCloseLine, CloseLine, MinimizeLine } from '@mingcute/react';
import { useAIConfigStore } from '../services/aiConfigStore';
import { useAIConfig } from '../hooks/useAIConfig';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut
} from '@/components/ui/context-menu';

export const AIConfigWindow: React.FC = () => {
  const { providers, updateProviders, selectedModel, updateSelectedModel } = useAIConfigStore();

  const config = useAIConfig({
    providers,
    updateProviders,
    selectedModel,
    updateSelectedModel,
  });

  const {
    selectedProviderId, setSelectedProviderId, selectedProvider,
    handleToggleProvider, handleUpdateProvider,
    showAddPlatform, setShowAddPlatform, isAddPlatformClosing,
    newPlatformName, setNewPlatformName,
    newPlatformUrl, setNewPlatformUrl,
    newPlatformDescription, setNewPlatformDescription,
    addPlatformErrors,
    handleAddPlatform, closeAddPlatform,
    showEditPlatform, isEditPlatformClosing,
    editPlatformName, setEditPlatformName,
    editPlatformUrl, setEditPlatformUrl,
    editPlatformErrors,
    editPlatformDescription, setEditPlatformDescription,
    handleSaveEditPlatform, closeEditPlatform,
    showAddModel, setShowAddModel, isAddModelClosing,
    newModelId, setNewModelId, newModelName, setNewModelName,
    handleAddModel, closeAddModel,
    showEditModel, isEditModelClosing,
    editModelId, setEditModelId, editModelName, setEditModelName,
    handleEditModel, handleSaveEditModel, closeEditModel,
    showApiKey, setShowApiKey,
    testingModelId,
    handleSelectModel,
    handleTestModelClick,
    handleDeleteModelClick,
    handlePlatformEdit,
    handlePlatformDelete,
  } = config;

  // ── Window-only state ───────────────────────────────────────────────
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowInitialSkeleton(false);
    }, 260);
    return () => window.clearTimeout(timer);
  }, []);

  const isBootstrapping = showInitialSkeleton && providers.length > 0;
  const skeletonBaseClass = 'animate-pulse rounded-md bg-gray-200 dark:bg-dark-element';

  const runWindowAction = useCallback(async (action: 'close' | 'minimize') => {
    try {
      const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      const currentWindow = getCurrentWebviewWindow();
      if (action === 'close') await currentWindow.close();
      if (action === 'minimize') await currentWindow.minimize();
    } catch {
      // ignore
    }
  }, []);

  const handleCloseWindow = useCallback(() => {
    void runWindowAction('close');
  }, [runWindowAction]);

  const handleMinimizeWindow = useCallback(() => {
    void runWindowAction('minimize');
  }, [runWindowAction]);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-100 font-sans select-none"
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        const isModelCard = target.closest('[data-model-card]');
        if (!isInputElement && !isModelCard) {
          e.preventDefault();
        }
      }}
    >

      {/* Left Categories */}
      <div className="w-64 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col">
        <div className="h-10 px-5 flex items-center justify-between bg-gray-50 dark:bg-dark-bg" data-tauri-drag-region>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 pointer-events-none">AI 平台管理</h2>
          <button
            onClick={() => setShowAddPlatform(true)}
            disabled={isBootstrapping}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-surface text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="添加自定义平台"
          >
            <AddLine className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 pt-0 space-y-1">
          {isBootstrapping ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`provider-skeleton-${index}`}
                className="flex items-center justify-between px-3 py-2 rounded-md"
              >
                <div className={`h-3.5 w-24 ${skeletonBaseClass}`} />
                <div className={`h-5 w-9 rounded-full animate-pulse bg-gray-200 dark:bg-dark-element`} />
              </div>
            ))
          ) : (
            providers.map(provider => {
              const card = (
                <div
                  key={provider.id}
                  data-platform-card={provider.isCustom ? 'true' : undefined}
                  onClick={() => setSelectedProviderId(provider.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${selectedProviderId === provider.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-600 dark:text-brand-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
                    }`}
                >
                  <span className="truncate pr-2">{provider.name}</span>
                  <Switch
                    checked={provider.isEnabled}
                    onCheckedChange={(c) => handleToggleProvider(provider.id, c)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );

              if (!provider.isCustom) return card;

              return (
                <ContextMenu key={provider.id}>
                  <ContextMenuTrigger asChild>
                    {card}
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => handlePlatformEdit(provider)}>
                      <Edit2Line className="w-4 h-4 mr-2" /> 编辑
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => handlePlatformDelete(provider)} className="text-red-500 hover:text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:focus:text-red-300">
                      <Delete2Line className="w-4 h-4 mr-2" /> 删除
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="relative flex-1 flex flex-col bg-white dark:bg-dark-surface">
        {isBootstrapping ? (
          <>
            <div className="relative h-10 flex items-center justify-between pl-6 pr-12">
              <div className="absolute top-0 left-0 right-[92px] h-10" data-tauri-drag-region />
              <div className={`relative z-10 h-5 w-36 ${skeletonBaseClass}`} />
              <button
                type="button"
                onClick={handleMinimizeWindow}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-0 right-[46px] z-[80] w-[46px] h-10 grid place-items-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element active:bg-gray-200 dark:active:bg-dark-border transition-colors"
                aria-label="最小化"
              >
                <MinimizeLine size={16} />
              </button>
              <button
                type="button"
                onClick={handleCloseWindow}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-0 right-0 z-[80] w-[46px] h-10 grid place-items-center text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
                aria-label="关闭"
              >
                <CloseLine size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className={`h-4 w-56 ${skeletonBaseClass}`} />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 rounded-full bg-blue-500/60" />
                  <div className={`h-5 w-24 ${skeletonBaseClass}`} />
                </div>
                <div className="space-y-2">
                  <div className={`h-3 w-16 ${skeletonBaseClass}`} />
                  <div className={`h-10 w-full ${skeletonBaseClass}`} />
                </div>
                <div className="space-y-2">
                  <div className={`h-3 w-16 ${skeletonBaseClass}`} />
                  <div className={`h-10 w-full ${skeletonBaseClass}`} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 rounded-full bg-purple-500/60" />
                  <div className={`h-5 w-24 ${skeletonBaseClass}`} />
                </div>
                <div className={`h-9 w-28 ${skeletonBaseClass}`} />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`model-skeleton-${index}`} className={`h-10 w-full ${skeletonBaseClass}`} />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : selectedProvider ? (
          <>
            {/* Header */}
            <div className="relative h-10 flex items-center justify-between pl-6 pr-12">
              <div className="absolute top-0 left-0 right-[92px] h-10" data-tauri-drag-region />
              <div className="relative z-10 flex-1 flex items-center pointer-events-none">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pointer-events-none">{selectedProvider.name}</h3>
              </div>
              <button
                type="button"
                onClick={handleMinimizeWindow}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-0 right-[46px] z-[80] w-[46px] h-10 grid place-items-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element active:bg-gray-200 dark:active:bg-dark-border transition-colors"
                aria-label="最小化"
              >
                <MinimizeLine size={16} />
              </button>
              <button
                type="button"
                onClick={handleCloseWindow}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-0 right-0 z-[80] w-[46px] h-10 grid place-items-center text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
                aria-label="关闭"
              >
                <CloseLine size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2 space-y-6">
              {/* Description */}
              {selectedProvider.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedProvider.description}
                </div>
              )}

              {/* API Config */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                    API 配置
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 dark:text-gray-400">API Key</Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={selectedProvider.apiKey}
                      onChange={(e) => handleUpdateProvider(selectedProvider.id, { apiKey: e.target.value })}
                      className="w-full pr-9 bg-white dark:bg-dark-element"
                      placeholder="请输入 API Key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-dark-element-hover"
                      title={showApiKey ? '隐藏 API Key' : '显示 API Key'}
                    >
                      {showApiKey ? <EyeCloseLine className="w-4 h-4" /> : <Eye2Line className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Base URL</Label>
                  <Input
                    type="text"
                    value={selectedProvider.baseUrl}
                    onChange={(e) => handleUpdateProvider(selectedProvider.id, { baseUrl: e.target.value })}
                    className="w-full bg-white dark:bg-dark-element"
                    placeholder="https://api.example.com/..."
                  />
                </div>
              </div>

              {/* Model Management */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                  <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                    模型管理
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModel(true)}
                  className="flex items-center gap-2 px-4 h-9 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-lg transition-colors w-fit"
                >
                  <AddLine className="w-4 h-4" />
                  添加模型
                </button>

                <div className="space-y-2">
                  {selectedProvider.models.map(model => {
                    const isSelected = selectedModel?.providerId === selectedProvider.id && selectedModel?.modelId === model.id;

                    return (
                      <ContextMenu key={model.id}>
                        <ContextMenuTrigger asChild>
                          <div
                            data-model-card
                            className={`flex items-center justify-between p-3 rounded-lg border group cursor-pointer transition-all ${isSelected
                              ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 shadow-sm'
                              : 'bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm'
                              }`}
                            onClick={() => handleSelectModel(model)}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                {isSelected && <CheckLine className="w-4 h-4 text-brand-500" />}
                                <span className={`text-sm font-medium ${isSelected ? 'text-brand-700 dark:text-brand-400' : 'text-gray-700 dark:text-gray-200'}`}>{model.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">右键菜单</span>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuItem onClick={() => handleTestModelClick(model)}>
                            <PlayLine className="w-4 h-4 mr-2" /> 测试连接
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleEditModel(model)}>
                            <Edit2Line className="w-4 h-4 mr-2" /> 编辑
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => config.handleCopyModel(model)}>
                            <Copy2Line className="w-4 h-4 mr-2" /> 复制配置
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => handleDeleteModelClick(model)} className="text-red-500 hover:text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:focus:text-red-300">
                            <Delete2Line className="w-4 h-4 mr-2" /> 删除
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  })}
                  {selectedProvider.models.length === 0 && (
                    <div className="text-center py-4 text-xs text-gray-400">
                      暂无模型，请添加
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            请选择左侧平台进行配置
          </div>
        )}
      </div>

      {/* Add Platform Modal */}
      <Dialog open={showAddPlatform || isAddPlatformClosing} onOpenChange={(open) => { if (!open) closeAddPlatform(); }}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">添加自定义平台</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="text"
              value={newPlatformName}
              onChange={(e) => setNewPlatformName(e.target.value)}
              placeholder="平台名称"
            />
            <Input
              type="text"
              value={newPlatformUrl}
              onChange={(e) => setNewPlatformUrl(e.target.value)}
              placeholder="Base URL (可选)"
            />
            {addPlatformErrors.baseUrl && (
              <p className="text-xs text-red-500">{addPlatformErrors.baseUrl.message}</p>
            )}
            <Input
              type="text"
              value={newPlatformDescription}
              onChange={(e) => setNewPlatformDescription(e.target.value)}
              placeholder="平台描述 (可选)"
            />
            <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
              <button
                onClick={closeAddPlatform}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-element-hover rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddPlatform}
                disabled={!newPlatformName.trim()}
                className="px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                确定
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Platform Modal */}
      <Dialog open={showEditPlatform || isEditPlatformClosing} onOpenChange={(open) => { if (!open) closeEditPlatform(); }}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">编辑平台</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="text"
              value={editPlatformName}
              onChange={(e) => setEditPlatformName(e.target.value)}
              placeholder="平台名称"
            />
            <Input
              type="text"
              value={editPlatformUrl}
              onChange={(e) => setEditPlatformUrl(e.target.value)}
              placeholder="Base URL"
            />
            {editPlatformErrors.baseUrl && (
              <p className="text-xs text-red-500">{editPlatformErrors.baseUrl.message}</p>
            )}
            <Input
              type="text"
              value={editPlatformDescription}
              onChange={(e) => setEditPlatformDescription(e.target.value)}
              placeholder="平台描述 (可选)"
            />
            <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
              <button
                onClick={closeEditPlatform}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-element-hover rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditPlatform}
                disabled={!editPlatformName.trim()}
                className="px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                保存
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Model Modal */}
      <Dialog open={showAddModel || isAddModelClosing} onOpenChange={(open) => { if (!open) closeAddModel(); }}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">添加模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400">模型 ID <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={newModelId}
                onChange={(e) => setNewModelId(e.target.value)}
                placeholder="例如: gpt-4o, qwen-plus"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400">显示名称</Label>
              <Input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="留空则使用模型 ID"
              />
            </div>
            <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
              <button
                onClick={closeAddModel}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-element-hover rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddModel}
                disabled={!newModelId.trim()}
                className="px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                确定
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>


      {/* Edit Model Modal */}
      <Dialog open={showEditModel || isEditModelClosing} onOpenChange={(open) => { if (!open) closeEditModel(); }}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">编辑模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400">模型 ID <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={editModelId}
                onChange={(e) => setEditModelId(e.target.value)}
                placeholder="例如: gpt-4o, qwen-plus"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 dark:text-gray-400">显示名称</Label>
              <Input
                type="text"
                value={editModelName}
                onChange={(e) => setEditModelName(e.target.value)}
                placeholder="留空则使用模型 ID"
              />
            </div>
            <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
              <button
                onClick={closeEditModel}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditModel}
                disabled={!editModelId.trim()}
                className="px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                保存
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* Input Context Menu */}
      <Toaster richColors position="top-center" closeButton />
    </div>
  );
};
