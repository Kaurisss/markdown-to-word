import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { X, Plus, Play, Trash2, Check, Loader2, Pencil, Copy, Eye, EyeOff } from 'lucide-react';
import { AIProvider, AIModel } from '../interfaces/AI';
import { useInputContextMenu } from '../hooks/useInputContextMenu';
import { ContextMenu } from './ui/ContextMenu';

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
  const modelContextMenuRef = useRef<HTMLDivElement | null>(null);

  // Edit model state
  const [showEditModel, setShowEditModel] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [editModelId, setEditModelId] = useState('');
  const [editModelName, setEditModelName] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Input context menu hook
  const { contextMenu: inputContextMenu, handleInputContextMenu, closeContextMenu: closeInputContextMenu } = useInputContextMenu();

  // Animation states
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [isAddPlatformClosing, setIsAddPlatformClosing] = useState(false);

  // Initialize selected provider
  useEffect(() => {
    if (isOpen && !selectedProviderId && providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
  }, [isOpen, providers, selectedProviderId]);

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

  const closeAddPlatform = () => {
    setIsAddPlatformClosing(true);
    setTimeout(() => {
      setShowAddPlatform(false);
      setIsAddPlatformClosing(false);
    }, 200);
  };

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
    onUpdateProviders(updated);
  };

  const handleUpdateProvider = useCallback((id: string, patch: Partial<AIProvider>) => {
    const updated = providers.map(p => p.id === id ? { ...p, ...patch } : p);
    onUpdateProviders(updated);
  }, [providers, onUpdateProviders]);

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
    // 如果删除的是当前选中的模型，需要处理
    if (currentModel?.providerId === selectedProvider.id && currentModel?.modelId === modelId) {
      onSelectModel({ providerId: '', modelId: '' }); // Or handle appropriately
    }
  }, [selectedProvider, handleUpdateProvider, currentModel, onSelectModel]);

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

  useLayoutEffect(() => {
    if (!modelContextMenu.visible) return;

    requestAnimationFrame(() => {
      if (!modelContextMenuRef.current) return;
      const { offsetWidth, offsetHeight } = modelContextMenuRef.current;
      const padding = 8;
      const maxX = window.innerWidth - offsetWidth - padding;
      const maxY = window.innerHeight - offsetHeight - padding;
      const nextX = Math.max(padding, Math.min(modelContextMenu.x, maxX));
      const nextY = Math.max(padding, Math.min(modelContextMenu.y, maxY));
      if (nextX !== modelContextMenu.x || nextY !== modelContextMenu.y) {
        setModelContextMenu(prev => prev.visible ? { ...prev, x: nextX, y: nextY } : prev);
      }
    });
  }, [modelContextMenu.visible, modelContextMenu.x, modelContextMenu.y]);

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
    onUpdateProviders([...providers, newProvider]);
    setSelectedProviderId(newId);
    closeAddPlatform();
    setNewPlatformName('');
    setNewPlatformUrl('');
    setNewPlatformDescription('');
  };

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
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
                <div 
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
                    provider.isEnabled 
                      ? 'bg-brand-500 dark:bg-brand-600' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleProvider(provider.id, !provider.isEnabled);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      provider.isEnabled ? 'translate-x-4' : 'translate-x-0'
                    } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
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
                <div className="flex-1 flex items-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 pointer-events-none">{selectedProvider.name}</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element transition-colors"
                  aria-label="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Description */}
                {selectedProvider.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
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
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <Plus className="w-4 h-4" />
                    添加模型
                  </button>

                  <div className="space-y-2">
                    {selectedProvider.models.map(model => {
                      const isSelected = currentModel?.providerId === selectedProvider.id && currentModel?.modelId === model.id;
                      const testResult = testResults[model.id];
                      const isTesting = testingModelId === model.id;
                      return (
                        <div
                          key={model.id}
                          data-model-card
                          className={`flex items-center justify-between p-3 rounded-lg border group cursor-pointer transition-all ${isSelected
                            ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 shadow-sm'
                            : 'bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm'
                            }`}
                          onClick={() => onSelectModel({ providerId: selectedProvider.id, modelId: model.id })}
                          onContextMenu={(e) => handleModelContextMenu(e, model)}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              {isSelected && <Check className="w-4 h-4 text-brand-500" />}
                              <span className={`text-sm font-medium ${isSelected ? 'text-brand-700 dark:text-brand-400' : 'text-gray-700 dark:text-gray-200'}`}>{model.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* 测试状态显示 */}
                            {isTesting && (
                              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                测试中...
                              </span>
                            )}
                            {!isTesting && testResult && (
                              <span className={`text-[10px] ${testResult.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                {testResult.status === 'success'
                                  ? `✓ ${testResult.time}ms`
                                  : `✗ ${testResult.message}`}
                              </span>
                            )}
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
        {showAddModel && (
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
                    onClick={() => { setShowAddModel(false); setNewModelId(''); setNewModelName(''); }}
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
        {showEditModel && (
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

      {/* Input Context Menu */}
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
