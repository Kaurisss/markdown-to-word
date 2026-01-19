import React, { useState } from 'react';
import { X, Plus, Play, Trash2, Settings2, Check, Loader2 } from 'lucide-react';
import { AIProvider, AIModel, DEFAULT_PROVIDERS } from '../interfaces/AI';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: AIProvider[];
  onUpdateProviders: (providers: AIProvider[]) => void;
  currentModel?: { providerId: string; modelId: string } | null;
  onSelectModel: (model: { providerId: string; modelId: string }) => void;
}

interface TestResult {
  status: 'success' | 'error';
  message: string;
  time?: number;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  onClose,
  providers,
  onUpdateProviders,
  currentModel,
  onSelectModel,
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0]?.id || '');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const [newModelId, setNewModelId] = useState('');
  
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  // Animation states
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [isAddPlatformClosing, setIsAddPlatformClosing] = useState(false);

  React.useEffect(() => {
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
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

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

  const handleUpdateProvider = (id: string, patch: Partial<AIProvider>) => {
    const updated = providers.map(p => p.id === id ? { ...p, ...patch } : p);
    onUpdateProviders(updated);
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
    onUpdateProviders([...providers, newProvider]);
    setSelectedProviderId(newId);
    closeAddPlatform();
    setNewPlatformName('');
    setNewPlatformUrl('');
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-dark-surface w-[800px] h-[500px] rounded-xl shadow-2xl flex overflow-hidden border border-gray-200 dark:border-dark-border ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">AI 平台管理</h2>
            <button 
              onClick={() => setShowAddPlatform(true)}
              className="text-gray-500 hover:text-brand-600 transition-colors"
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
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{selectedProvider.name}</h3>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
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
                      className="flex-1 h-8 px-3 text-xs rounded border border-gray-200 dark:border-dark-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                      placeholder="输入模型ID"
                    />
                    <button
                      onClick={handleAddModel}
                      className="h-8 px-4 bg-brand-500 hover:bg-brand-600 text-white text-xs rounded font-medium transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      添加模型
                    </button>
                  </div>

                  <div className="border border-gray-200 dark:border-dark-border rounded-lg divide-y divide-gray-100 dark:divide-dark-border">
                    {selectedProvider.models.length === 0 && (
                      <div className="p-4 text-center text-xs text-gray-400">暂无模型，请添加</div>
                    )}
                    {selectedProvider.models.map(model => (
                      <div key={model.id}>
                        <div 
                          className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors group rounded-lg cursor-pointer"
                          onClick={() => onSelectModel({ providerId: selectedProvider.id, modelId: model.id })}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{model.name}</span>
                            {currentModel?.providerId === selectedProvider.id && currentModel?.modelId === model.id && (
                              <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">当前使用</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleTestModel(model.id); }}
                              disabled={testingModelId === model.id}
                              className={`p-1 transition-colors ${testingModelId === model.id ? 'text-brand-500 cursor-wait' : 'text-gray-400 hover:text-brand-500'}`}
                              title="测试运行"
                            >
                              {testingModelId === model.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.id); }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Test Result Message */}
                        {testResults[model.id] && (
                          <div className={`mx-3 mb-2 p-2 rounded text-xs flex items-center justify-between animate-fade-in ${
                            testResults[model.id].status === 'success' 
                              ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
                              : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {testResults[model.id].status === 'success' ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {testResults[model.id].status === 'success' 
                                  ? `连接成功！响应: "${testResults[model.id].message}" 响应时间: ${testResults[model.id].time}ms`
                                  : `连接失败: ${testResults[model.id].message}`
                                }
                              </span>
                            </div>
                            <button 
                              onClick={() => setTestResults(prev => {
                                const next = { ...prev };
                                delete next[model.id];
                                return next;
                              })}
                              className="ml-2 hover:opacity-70"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
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
      </div>

      {/* Add Platform Modal Overlay */}
      {(showAddPlatform || isAddPlatformClosing) && (
        <div 
          className={`absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm ${isAddPlatformClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
          onClick={(e) => {
            e.stopPropagation();
            closeAddPlatform();
          }}
        >
          <div 
            className={`bg-white dark:bg-dark-surface w-[400px] rounded-xl shadow-2xl p-6 space-y-4 ${isAddPlatformClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">添加新平台</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">平台名称</label>
              <input
                type="text"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                className="w-full h-10 px-3 rounded border border-gray-300 dark:border-dark-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors text-sm"
                placeholder="例如: My Custom AI"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Base URL</label>
              <input
                type="text"
                value={newPlatformUrl}
                onChange={(e) => setNewPlatformUrl(e.target.value)}
                className="w-full h-10 px-3 rounded border border-gray-300 dark:border-dark-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors text-sm"
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeAddPlatform}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddPlatform}
                disabled={!newPlatformName.trim()}
                className="px-6 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-colors shadow-sm"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
