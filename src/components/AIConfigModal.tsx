import React, { useState, useEffect } from 'react';
import { AddLine, CloseLine, CheckLine, LoadingLine, PlayLine, Delete2Line, Edit2Line, Copy2Line, Eye2Line, EyeCloseLine } from '@mingcute/react';
import { AIProvider } from '../interfaces/AI';
import { useAIConfig } from '../hooks/useAIConfig';
import { ContextMenu } from './ui/ContextMenu';
import { Switch } from './ui/switch';
import { Toaster } from '@/components/ui/sonner';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: AIProvider[];
  onUpdateProviders: (providers: AIProvider[]) => void;
  currentModel?: { providerId: string; modelId: string } | null;
  onSelectModel: (model: { providerId: string; modelId: string }) => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  onClose,
  providers,
  onUpdateProviders,
  currentModel,
  onSelectModel,
}) => {
  const config = useAIConfig({
    providers,
    updateProviders: onUpdateProviders,
    selectedModel: currentModel ?? null,
    updateSelectedModel: (model) => {
      if (model) {
        onSelectModel(model);
      } else {
        onSelectModel({ providerId: '', modelId: '' });
      }
    },
  });

  const {
    selectedProviderId, setSelectedProviderId, selectedProvider,
    handleToggleProvider, handleUpdateProvider,
    showAddPlatform, setShowAddPlatform, isAddPlatformClosing,
    newPlatformName, setNewPlatformName,
    newPlatformUrl, setNewPlatformUrl,
    newPlatformDescription, setNewPlatformDescription,
    handleAddPlatform, closeAddPlatform,
    showAddModel, setShowAddModel, isAddModelClosing,
    newModelId, setNewModelId, newModelName, setNewModelName,
    handleAddModel, closeAddModel,
    showEditModel, isEditModelClosing,
    editModelId, setEditModelId, editModelName, setEditModelName,
    handleEditModel, handleSaveEditModel, closeEditModel,
    showApiKey, setShowApiKey,
    testingModelId,
    handleSelectModel,
    modelContextMenu, modelContextMenuRef,
    handleModelContextMenu,
    handleContextMenuTest, handleContextMenuDelete,
    inputContextMenu, handleInputContextMenu, closeInputContextMenu,
  } = config;

  // Modal animation states
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={onClose}
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        const isModelCard = target.closest('[data-model-card]');
        if (!isInputElement && !isModelCard) {
          e.preventDefault();
        }
      }}
    >
      <div
        className={`bg-white dark:bg-dark-surface w-[800px] h-[550px] rounded-xl shadow-2xl flex overflow-hidden border border-gray-200 dark:border-dark-border ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col">
          <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 pointer-events-none">AI 平台管理</h2>
            <button
              onClick={() => setShowAddPlatform(true)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-surface text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="添加自定义平台"
            >
              <AddLine className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2 pt-0 space-y-1">
            {providers.map(provider => (
              <div
                key={provider.id}
                onClick={() => setSelectedProviderId(provider.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${
                  selectedProviderId === provider.id
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
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-dark-surface">
          {selectedProvider ? (
            <>
              {/* Header */}
              <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 dark:border-dark-border">
                <div className="flex-1 flex items-center">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pointer-events-none">{selectedProvider.name}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element transition-colors"
                  aria-label="关闭"
                >
                  <CloseLine className="w-5 h-5" />
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
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">API Key</label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={selectedProvider.apiKey}
                        onChange={(e) => handleUpdateProvider(selectedProvider.id, { apiKey: e.target.value })}
                        onContextMenu={handleInputContextMenu}
                        className="w-full h-10 px-3 pr-9 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-element focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
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
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Base URL</label>
                    <input
                      type="text"
                      value={selectedProvider.baseUrl}
                      onChange={(e) => handleUpdateProvider(selectedProvider.id, { baseUrl: e.target.value })}
                      onContextMenu={handleInputContextMenu}
                      className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-element text-gray-600 dark:text-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
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
                      const isSelected = currentModel?.providerId === selectedProvider.id && currentModel?.modelId === model.id;
                      return (
                        <div
                          key={model.id}
                          data-model-card
                          className={`flex items-center justify-between p-3 rounded-lg border group cursor-pointer transition-all ${isSelected
                            ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 shadow-sm'
                            : 'bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm'
                            }`}
                          onClick={() => handleSelectModel(model)}
                          onContextMenu={(e) => handleModelContextMenu(e, model)}
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

        {/* Add Platform Modal (Nested) */}
        {(showAddPlatform || isAddPlatformClosing) && (
          <div
            className={`absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm ${isAddPlatformClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={(e) => {
              e.stopPropagation();
              closeAddPlatform();
            }}
          >
            <div
              className={`bg-white dark:bg-dark-surface w-80 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-dark-border ${isAddPlatformClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">添加自定义平台</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  onContextMenu={handleInputContextMenu}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-element dark:text-gray-100"
                  placeholder="平台名称"
                />
                <input
                  type="text"
                  value={newPlatformUrl}
                  onChange={(e) => setNewPlatformUrl(e.target.value)}
                  onContextMenu={handleInputContextMenu}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-element dark:text-gray-100"
                  placeholder="Base URL (可选)"
                />
                <input
                  type="text"
                  value={newPlatformDescription}
                  onChange={(e) => setNewPlatformDescription(e.target.value)}
                  onContextMenu={handleInputContextMenu}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-element dark:text-gray-100"
                  placeholder="平台描述 (可选)"
                />
                <div className="flex justify-end gap-2 mt-4">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Model Modal */}
        {(showAddModel || isAddModelClosing) && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-surface w-80 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-dark-border animate-scale-in">
              <h3 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">添加模型</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">模型 ID <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newModelId}
                    onChange={(e) => setNewModelId(e.target.value)}
                    onContextMenu={handleInputContextMenu}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-element dark:text-gray-100"
                    placeholder="例如: gpt-4o, qwen-plus"
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">显示名称</label>
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    onContextMenu={handleInputContextMenu}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-element dark:text-gray-100"
                    placeholder="留空则使用模型 ID"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Model Modal */}
        {(showEditModel || isEditModelClosing) && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-surface w-80 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-dark-border animate-scale-in">
              <h3 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">编辑模型</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">模型 ID <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editModelId}
                    onChange={(e) => setEditModelId(e.target.value)}
                    onContextMenu={handleInputContextMenu}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-bg dark:text-gray-100"
                    placeholder="例如: gpt-4o, qwen-plus"
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">显示名称</label>
                  <input
                    type="text"
                    value={editModelName}
                    onChange={(e) => setEditModelName(e.target.value)}
                    onContextMenu={handleInputContextMenu}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-bg dark:text-gray-100"
                    placeholder="留空则使用模型 ID"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
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
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Model Context Menu */}
      {modelContextMenu.visible && (
        <div
          className="fixed z-[70] bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-dark-border py-1 min-w-[140px] animate-scale-in"
          style={{ left: modelContextMenu.x, top: modelContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          ref={modelContextMenuRef}
        >
          <button
            onClick={handleEditModel}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Edit2Line className="w-3.5 h-3.5" />
            编辑模型
          </button>
          <button
            onClick={config.handleCopyModel}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Copy2Line className="w-3.5 h-3.5" />
            复制模型
          </button>
          <button
            onClick={handleContextMenuTest}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <PlayLine className="w-3.5 h-3.5" />
            测试模型
          </button>
          <div className="my-1 border-t border-gray-100 dark:border-dark-border" />
          <button
            onClick={handleContextMenuDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Delete2Line className="w-3.5 h-3.5" />
            删除模型
          </button>
        </div>
      )}

      {/* Input Context Menu */}
      <Toaster richColors position="top-center" closeButton />
      <ContextMenu
        visible={inputContextMenu.visible}
        x={inputContextMenu.x}
        y={inputContextMenu.y}
        items={inputContextMenu.items}
        onClose={closeInputContextMenu}
      />
    </div>
  );
};
