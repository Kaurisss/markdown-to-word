import React, { useState, useEffect } from 'react';
import { X, Plus, Play, Trash2, Settings2, Check, Loader2 } from 'lucide-react';
import { AIProvider, AIModel } from '../interfaces/AI';
import { useAIConfigStore } from '../services/aiConfigStore';

export const AIConfigWindow: React.FC = () => {
  const { providers, updateProviders } = useAIConfigStore();
  
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const [newModelId, setNewModelId] = useState('');
  
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, {
    status: 'success' | 'error';
    message: string;
    time?: number;
  }>>({});

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
    const newModel: AIModel = { id: newModelId, name: newModelId };
    handleUpdateProvider(selectedProvider.id, {
      models: [...selectedProvider.models, newModel]
    });
    setNewModelId('');
  };

  const handleDeleteModel = (modelId: string) => {
    if (!selectedProvider) return;
    handleUpdateProvider(selectedProvider.id, {
      models: selectedProvider.models.filter(m => m.id !== modelId)
    });
  };

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newProvider: AIProvider = {
      id: newId,
      name: newPlatformName,
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
  };

  const handleCloseWindow = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch {
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-100 font-sans select-none">
      
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
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                selectedProviderId === provider.id
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
                  className={`${
                    provider.isEnabled ? 'translate-x-4' : 'translate-x-0'
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
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 border-l-4 border-brand-500 pl-2">
                  API 配置
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">API Key</label>
                  <input
                    type="password"
                    value={selectedProvider.apiKey}
                    onChange={(e) => handleUpdateProvider(selectedProvider.id, { apiKey: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:bg-white dark:focus:bg-dark-surface focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                    placeholder="请输入 API Key"
                  />
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

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newModelId}
                    onChange={(e) => setNewModelId(e.target.value)}
                    className="flex-1 h-8 px-3 text-xs rounded border border-gray-200 dark:border-dark-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-gray-50 dark:bg-dark-bg dark:text-gray-200"
                    placeholder="输入模型ID"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddModel()}
                  />
                  <button
                    onClick={handleAddModel}
                    disabled={!newModelId.trim()}
                    className="px-3 h-8 bg-brand-500 text-white text-xs rounded hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    添加
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedProvider.models.map(model => (
                    <div key={model.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-bg rounded border border-gray-100 dark:border-dark-border group">
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{model.id}</span>
                      <div className="flex items-center gap-2">
                        {/* Test Button */}
                        <button
                          onClick={() => handleTestModel(model.id)}
                          disabled={testingModelId === model.id}
                          className={`
                            flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors
                            ${testResults[model.id]?.status === 'success' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : testResults[model.id]?.status === 'error'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          {testingModelId === model.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : testResults[model.id]?.status === 'success' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          <span>
                            {testingModelId === model.id ? '测试中...' : '测试'}
                          </span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteModel(model.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
    </div>
  );
};
