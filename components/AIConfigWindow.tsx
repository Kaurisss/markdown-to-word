import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Play, Trash2, Settings2, Check, Loader2, Pencil, Copy, Eye, EyeOff } from 'lucide-react';
import { AIProvider, AIModel } from '../interfaces/AI';
import { useAIConfigStore } from '../services/aiConfigStore';

export const AIConfigWindow: React.FC = () => {
  const { providers, updateProviders } = useAIConfigStore();

  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const [newPlatformDescription, setNewPlatformDescription] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');

  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, {
    status: 'success' | 'error';
    message: string;
    time?: number;
  }>>({});

  // Context menu state
  const [modelContextMenu, setModelContextMenu] = useState<{ visible: boolean; x: number; y: number; model: AIModel | null }>({
    visible: false,
    x: 0,
    y: 0,
    model: null
  });

  // Edit model state
  const [showEditModel, setShowEditModel] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [editModelId, setEditModelId] = useState('');
  const [editModelName, setEditModelName] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Initialize selected provider
  useEffect(() => {
    if (!selectedProviderId && providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
  }, [providers, selectedProviderId]);

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  const handleTestModel = async (modelId: string) => {
    if (!selectedProvider) return;
    if (!selectedProvider.apiKey) {
      setTestResults(prev => ({
        ...prev,
        [modelId]: { status: 'error', message: '请先配置 API Key' }
      }));
      return;
    }

    setTestingModelId(modelId);
    setTestResults(prev => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(selectedProvider.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedProvider.apiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: 'Say "Test success"' }],
          max_tokens: 10,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMsg = errorData.error.message;
          }
        } catch (e) {
          // ignore
        }
        throw new Error(errorMsg);
      }

      setTestResults(prev => ({
        ...prev,
        [modelId]: {
          status: 'success',
          message: '测试成功',
          time: duration
        }
      }));

    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [modelId]: {
          status: 'error',
          message: error.message || '连接失败'
        }
      }));
    } finally {
      setTestingModelId(null);
    }
  };

  const handleToggleProvider = (id: string, checked: boolean) => {
    const updated = providers.map(p => p.id === id ? { ...p, isEnabled: checked } : p);
    updateProviders(updated);
  };

  const handleUpdateProvider = (id: string, patch: Partial<AIProvider>) => {
    const updated = providers.map(p => p.id === id ? { ...p, ...patch } : p);
    updateProviders(updated);
  };

  const handleAddModel = () => {
    if (!selectedProvider || !newModelId.trim()) return;
    const newModel: AIModel = { id: newModelId.trim(), name: newModelName.trim() || newModelId.trim() };
    handleUpdateProvider(selectedProvider.id, {
      models: [...selectedProvider.models, newModel]
    });
    setNewModelId('');
    setNewModelName('');
    setShowAddModel(false);
  };

  const handleDeleteModel = useCallback((modelId: string) => {
    if (!selectedProvider) return;
    handleUpdateProvider(selectedProvider.id, {
      models: selectedProvider.models.filter(m => m.id !== modelId)
    });
  }, [selectedProvider, handleUpdateProvider]);

  const handleModelContextMenu = useCallback((e: React.MouseEvent, model: AIModel) => {
    e.preventDefault();
    e.stopPropagation();
    setModelContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      model
    });
  }, []);

  const closeModelContextMenu = useCallback(() => {
    setModelContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const handleEditModel = useCallback(() => {
    if (!modelContextMenu.model) return;
    setEditingModel(modelContextMenu.model);
    setEditModelId(modelContextMenu.model.id);
    setEditModelName(modelContextMenu.model.name);
    setShowEditModel(true);
    closeModelContextMenu();
  }, [modelContextMenu.model, closeModelContextMenu]);

  const handleSaveEditModel = useCallback(() => {
    if (!selectedProvider || !editingModel || !editModelId.trim()) return;
    const updatedModels = selectedProvider.models.map(m =>
      m.id === editingModel.id
        ? { id: editModelId.trim(), name: editModelName.trim() || editModelId.trim() }
        : m
    );
    handleUpdateProvider(selectedProvider.id, { models: updatedModels });
    setShowEditModel(false);
    setEditingModel(null);
  }, [selectedProvider, editingModel, editModelId, editModelName, handleUpdateProvider]);

  const handleCopyModel = useCallback(() => {
    if (!selectedProvider || !modelContextMenu.model) return;
    const original = modelContextMenu.model;
    const newModel: AIModel = {
      id: `${original.id}-copy`,
      name: `${original.name} (副本)`
    };
    handleUpdateProvider(selectedProvider.id, {
      models: [...selectedProvider.models, newModel]
    });
    closeModelContextMenu();
  }, [selectedProvider, modelContextMenu.model, handleUpdateProvider, closeModelContextMenu]);

  const handleContextMenuTest = useCallback(() => {
    if (!modelContextMenu.model) return;
    handleTestModel(modelContextMenu.model.id);
    closeModelContextMenu();
  }, [modelContextMenu.model, handleTestModel, closeModelContextMenu]);

  const handleContextMenuDelete = useCallback(() => {
    if (!modelContextMenu.model) return;
    handleDeleteModel(modelContextMenu.model.id);
    closeModelContextMenu();
  }, [modelContextMenu.model, handleDeleteModel, closeModelContextMenu]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      if (modelContextMenu.visible) {
        closeModelContextMenu();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [modelContextMenu.visible, closeModelContextMenu]);

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newProvider: AIProvider = {
      id: newId,
      name: newPlatformName,
      description: newPlatformDescription || undefined,
      isEnabled: true,
      apiKey: '',
      baseUrl: newPlatformUrl || 'https://api.example.com/v1/chat/completions',
      models: [],
      isCustom: true
    };
    updateProviders([...providers, newProvider]);
    setSelectedProviderId(newId);
    setShowAddPlatform(false);
    setNewPlatformName('');
    setNewPlatformUrl('');
    setNewPlatformDescription('');
  };

  const handleCloseWindow = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch {
    }
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-100 font-sans select-none"
      onContextMenu={(e) => {
        // Only prevent default if not on a model card (which has its own context menu)
        const target = e.target as HTMLElement;
        if (!target.closest('[data-model-card]')) {
          e.preventDefault();
        }
      }}
    >

      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-surface/50" data-tauri-drag-region>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 pointer-events-none">AI 平台管理</h2>
          <button
            onClick={() => setShowAddPlatform(true)}
            className="text-gray-500 hover:text-brand-600 transition-colors"
            title="添加自定义平台"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {providers.map(provider => (
            <div
              key={provider.id}
              onClick={() => setSelectedProviderId(provider.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs ${selectedProviderId === provider.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-600 dark:text-brand-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <span className="font-medium truncate pr-2">{provider.name}</span>
              <div
                className="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleProvider(provider.id, !provider.isEnabled);
                }}
                style={{ backgroundColor: provider.isEnabled ? '#3b82f6' : '#e5e7eb' }}
              >
                <span
                  aria-hidden="true"
                  className={`${provider.isEnabled ? 'translate-x-4' : 'translate-x-0'
                    } pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                />
              </div>
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
              <div className="flex-1 flex items-center" data-tauri-drag-region>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 pointer-events-none">{selectedProvider.name}</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseWindow}
                className="w-8 h-8 grid place-items-center rounded text-gray-500 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* API Config */}
              <div className="space-y-4">
                {selectedProvider.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-2 mb-2">
                    {selectedProvider.description}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 border-l-4 border-brand-500 pl-2">
                  API 配置
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={selectedProvider.apiKey}
                      onChange={(e) => handleUpdateProvider(selectedProvider.id, { apiKey: e.target.value })}
                      className="w-full h-9 px-3 pr-9 text-xs rounded border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:bg-white dark:focus:bg-dark-surface focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                      placeholder="请输入 API Key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title={showApiKey ? '隐藏 API Key' : '显示 API Key'}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Base URL</label>
                  <input
                    type="text"
                    value={selectedProvider.baseUrl}
                    onChange={(e) => handleUpdateProvider(selectedProvider.id, { baseUrl: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-600 dark:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                    placeholder="https://api.example.com/..."
                  />
                </div>
              </div>

              {/* Model Management */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 border-l-4 border-purple-500 pl-2">
                  模型管理
                </div>

                <button
                  onClick={() => setShowAddModel(true)}
                  className="flex items-center gap-1.5 px-3 h-8 text-xs text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加模型
                </button>

                <div className="space-y-2">
                  {selectedProvider.models.map(model => (
                    <div
                      key={model.id}
                      data-model-card
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-bg rounded border border-gray-100 dark:border-dark-border group cursor-context-menu hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                      onContextMenu={(e) => handleModelContextMenu(e, model)}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{model.name}</span>
                        {model.name !== model.id && (
                          <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{model.id}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">右键菜单</span>
                    </div>
                  ))}
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
      {showAddPlatform && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface w-80 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-dark-border animate-scale-in">
            <h3 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">添加自定义平台</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-bg dark:text-gray-100"
                placeholder="平台名称"
              />
              <input
                type="text"
                value={newPlatformUrl}
                onChange={(e) => setNewPlatformUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-bg dark:text-gray-100"
                placeholder="Base URL (可选)"
              />
              <input
                type="text"
                value={newPlatformDescription}
                onChange={(e) => setNewPlatformDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-bg dark:text-gray-100"
                placeholder="平台描述 (可选)"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowAddPlatform(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
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
      {showAddModel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface w-80 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-dark-border animate-scale-in">
            <h3 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">添加模型</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">模型 ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newModelId}
                  onChange={(e) => setNewModelId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-bg dark:text-gray-100"
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
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-bg dark:text-gray-100"
                  placeholder="留空则使用模型 ID"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => { setShowAddModel(false); setNewModelId(''); setNewModelName(''); }}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
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

      {/* Model Context Menu */}
      {modelContextMenu.visible && (
        <div
          className="fixed z-[70] bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-dark-border py-1 min-w-[140px] animate-scale-in"
          style={{ left: modelContextMenu.x, top: modelContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditModel}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            编辑模型
          </button>
          <button
            onClick={handleCopyModel}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            复制模型
          </button>
          <button
            onClick={handleContextMenuTest}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            测试模型
          </button>
          <div className="my-1 border-t border-gray-100 dark:border-dark-border" />
          <button
            onClick={handleContextMenuDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            删除模型
          </button>
        </div>
      )}

      {/* Edit Model Modal */}
      {showEditModel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface w-80 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-dark-border animate-scale-in">
            <h3 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">编辑模型</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">模型 ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editModelId}
                  onChange={(e) => setEditModelId(e.target.value)}
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
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-dark-bg dark:text-gray-100"
                  placeholder="留空则使用模型 ID"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => { setShowEditModel(false); setEditingModel(null); }}
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
  );
};
