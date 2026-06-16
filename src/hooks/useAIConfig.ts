import { useState, useEffect, useCallback } from 'react';
import { AIProvider, AIModel } from '../interfaces/AI';
import { toast } from 'sonner';

export interface UseAIConfigParams {
  providers: AIProvider[];
  updateProviders: (providers: AIProvider[]) => void;
  selectedModel: { providerId: string; modelId: string } | null;
  updateSelectedModel: (model: { providerId: string; modelId: string } | null) => void;
}


export function useAIConfig({
  providers,
  updateProviders,
  selectedModel,
  updateSelectedModel,
}: UseAIConfigParams) {
  // ── Provider selection ──────────────────────────────────────────────
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  // ── Add-platform dialog ─────────────────────────────────────────────
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [isAddPlatformClosing, setIsAddPlatformClosing] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const [newPlatformDescription, setNewPlatformDescription] = useState('');

  // ── Edit-platform dialog ────────────────────────────────────────────
  const [showEditPlatform, setShowEditPlatform] = useState(false);
  const [isEditPlatformClosing, setIsEditPlatformClosing] = useState(false);
  const [editingPlatformId, setEditingPlatformId] = useState('');
  const [editPlatformName, setEditPlatformName] = useState('');
  const [editPlatformUrl, setEditPlatformUrl] = useState('');
  const [editPlatformDescription, setEditPlatformDescription] = useState('');

  // ── Add-model dialog ────────────────────────────────────────────────
  const [showAddModel, setShowAddModel] = useState(false);
  const [isAddModelClosing, setIsAddModelClosing] = useState(false);
  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');

  // ── Edit-model dialog ───────────────────────────────────────────────
  const [showEditModel, setShowEditModel] = useState(false);
  const [isEditModelClosing, setIsEditModelClosing] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [editModelId, setEditModelId] = useState('');
  const [editModelName, setEditModelName] = useState('');

  // ── API key visibility ──────────────────────────────────────────────
  const [showApiKey, setShowApiKey] = useState(false);

  // ── API testing ─────────────────────────────────────────────────────
  const [testingModelId, setTestingModelId] = useState<string | null>(null);

  // (Removed Context Menus here)

  // ── Derived values ──────────────────────────────────────────────────
  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  // ── Initialize selected provider ────────────────────────────────────
  useEffect(() => {
    if (!selectedProviderId && providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
  }, [providers, selectedProviderId]);

  // ── Animated dialog close helpers (no deps – defined first) ─────────

  const closeAddPlatform = useCallback(() => {
    setIsAddPlatformClosing(true);
    setTimeout(() => {
      setShowAddPlatform(false);
      setIsAddPlatformClosing(false);
    }, 200);
  }, []);

  const closeEditPlatform = useCallback(() => {
    setIsEditPlatformClosing(true);
    setTimeout(() => {
      setShowEditPlatform(false);
      setIsEditPlatformClosing(false);
      setEditingPlatformId('');
      setEditPlatformName('');
      setEditPlatformUrl('');
      setEditPlatformDescription('');
    }, 200);
  }, []);

  const closeAddModel = useCallback(() => {
    setIsAddModelClosing(true);
    setTimeout(() => {
      setShowAddModel(false);
      setIsAddModelClosing(false);
      setNewModelId('');
      setNewModelName('');
    }, 200);
  }, []);

  const closeEditModel = useCallback(() => {
    setIsEditModelClosing(true);
    setTimeout(() => {
      setShowEditModel(false);
      setIsEditModelClosing(false);
      setEditingModel(null);
    }, 200);
  }, []);

  // (Removed close context menu functions)

  // ── Core provider helpers ───────────────────────────────────────────

  const handleUpdateProvider = useCallback((id: string, patch: Partial<AIProvider>) => {
    const updated = providers.map(p => p.id === id ? { ...p, ...patch } : p);
    updateProviders(updated);
  }, [providers, updateProviders]);

  const handleToggleProvider = useCallback((id: string, checked: boolean) => {
    const updated = providers.map(p => p.id === id ? { ...p, isEnabled: checked } : p);
    updateProviders(updated);
  }, [providers, updateProviders]);

  // ── API testing ─────────────────────────────────────────────────────

  const handleTestModel = useCallback((modelId: string) => {
    if (!selectedProvider) return;
    if (!selectedProvider.apiKey) {
      toast.error('配置错误', { description: '请先配置 API Key' });
      return;
    }

    setTestingModelId(modelId);

    const testPromise = async () => {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(selectedProvider.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${selectedProvider.apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: [{ role: 'user', content: 'Say "Test success"' }],
            max_tokens: 10,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData.error?.message) {
              errorMsg = errorData.error.message;
            }
          } catch {
            // ignore parse errors
          }
          throw new Error(errorMsg);
        }

        return `连接成功 (${duration}ms)`;
      } finally {
        setTestingModelId(null);
      }
    };

    toast.promise(testPromise(), {
      loading: '正在测试连接...',
      success: (data) => data,
      error: (err) => err instanceof Error ? err.message : '连接失败',
    });
  }, [selectedProvider]);

  // ── Model CRUD ──────────────────────────────────────────────────────

  const handleSelectModel = useCallback((model: AIModel) => {
    if (!selectedProvider) return;
    const isCurrentlySelected =
      selectedModel?.providerId === selectedProvider.id &&
      selectedModel?.modelId === model.id;
    if (isCurrentlySelected) {
      updateSelectedModel(null);
    } else {
      updateSelectedModel({ providerId: selectedProvider.id, modelId: model.id });
    }
  }, [selectedProvider, selectedModel, updateSelectedModel]);

  const handleAddModel = useCallback(() => {
    if (!selectedProvider || !newModelId.trim()) return;
    const model: AIModel = {
      id: newModelId.trim(),
      name: newModelName.trim() || newModelId.trim(),
    };
    handleUpdateProvider(selectedProvider.id, {
      models: [...selectedProvider.models, model],
    });
    closeAddModel();
  }, [selectedProvider, newModelId, newModelName, handleUpdateProvider, closeAddModel]);

  const handleDeleteModel = useCallback((modelId: string) => {
    if (!selectedProvider) return;
    handleUpdateProvider(selectedProvider.id, {
      models: selectedProvider.models.filter(m => m.id !== modelId),
    });
    if (
      selectedModel?.providerId === selectedProvider.id &&
      selectedModel?.modelId === modelId
    ) {
      updateSelectedModel(null);
    }
  }, [selectedProvider, handleUpdateProvider, selectedModel, updateSelectedModel]);

  const handleSaveEditModel = useCallback(() => {
    if (!selectedProvider || !editingModel || !editModelId.trim()) return;
    const updatedModels = selectedProvider.models.map(m =>
      m.id === editingModel.id
        ? { id: editModelId.trim(), name: editModelName.trim() || editModelId.trim() }
        : m,
    );
    handleUpdateProvider(selectedProvider.id, { models: updatedModels });
    closeEditModel();
  }, [selectedProvider, editingModel, editModelId, editModelName, handleUpdateProvider, closeEditModel]);

  const handleCopyModel = useCallback((model: AIModel) => {
    if (!selectedProvider) return;
    const newModel: AIModel = {
      id: `${model.id}-copy`,
      name: `${model.name} (副本)`,
    };
    handleUpdateProvider(selectedProvider.id, {
      models: [...selectedProvider.models, newModel],
    });
  }, [selectedProvider, handleUpdateProvider]);

  // ── Platform CRUD ───────────────────────────────────────────────────

  const handleAddPlatform = useCallback(() => {
    if (!newPlatformName.trim()) return;
    const newId = `custom-${Date.now()}`;
    const provider: AIProvider = {
      id: newId,
      name: newPlatformName,
      description: newPlatformDescription || undefined,
      isEnabled: true,
      apiKey: '',
      baseUrl: newPlatformUrl || 'https://api.example.com/v1/chat/completions',
      models: [],
      isCustom: true,
    };
    updateProviders([...providers, provider]);
    setSelectedProviderId(newId);
    closeAddPlatform();
    setNewPlatformName('');
    setNewPlatformUrl('');
    setNewPlatformDescription('');
  }, [newPlatformName, newPlatformUrl, newPlatformDescription, providers, updateProviders, closeAddPlatform]);

  const handleStartEditPlatform = useCallback((provider: AIProvider) => {
    if (!provider.isCustom) return;
    setEditingPlatformId(provider.id);
    setEditPlatformName(provider.name);
    setEditPlatformUrl(provider.baseUrl);
    setEditPlatformDescription(provider.description || '');
    setShowEditPlatform(true);
  }, []);

  const handleSaveEditPlatform = useCallback(() => {
    if (!editingPlatformId || !editPlatformName.trim()) return;
    handleUpdateProvider(editingPlatformId, {
      name: editPlatformName.trim(),
      baseUrl: editPlatformUrl.trim() || 'https://api.example.com/v1/chat/completions',
      description: editPlatformDescription.trim() || undefined,
    });
    closeEditPlatform();
  }, [editingPlatformId, editPlatformName, editPlatformUrl, editPlatformDescription, handleUpdateProvider, closeEditPlatform]);

  const handleDeletePlatform = useCallback((provider: AIProvider) => {
    if (!provider.isCustom) return;
    const updated = providers.filter(p => p.id !== provider.id);
    updateProviders(updated);
    if (selectedProviderId === provider.id) {
      const next = updated.find(p => p.id !== provider.id);
      setSelectedProviderId(next?.id ?? '');
    }
    if (selectedModel?.providerId === provider.id) {
      updateSelectedModel(null);
    }
  }, [providers, selectedProviderId, selectedModel, updateProviders, updateSelectedModel]);

  // ── Action handlers ─────────────────────────────────────────────────

  const handleEditModel = useCallback((model: AIModel) => {
    setEditingModel(model);
    setEditModelId(model.id);
    setEditModelName(model.name);
    setShowEditModel(true);
  }, []);

  const handleTestModelClick = useCallback((model: AIModel) => {
    handleTestModel(model.id);
  }, [handleTestModel]);

  const handleDeleteModelClick = useCallback((model: AIModel) => {
    handleDeleteModel(model.id);
  }, [handleDeleteModel]);

  const handlePlatformEdit = useCallback((provider: AIProvider) => {
    handleStartEditPlatform(provider);
  }, [handleStartEditPlatform]);

  const handlePlatformDelete = useCallback((provider: AIProvider) => {
    handleDeletePlatform(provider);
  }, [handleDeletePlatform]);



  // ── Return everything components need ───────────────────────────────

  return {
    // Provider selection
    selectedProviderId,
    setSelectedProviderId,
    selectedProvider,

    // Provider management
    handleToggleProvider,
    handleUpdateProvider,

    // Add-platform dialog
    showAddPlatform,
    setShowAddPlatform,
    isAddPlatformClosing,
    newPlatformName,
    setNewPlatformName,
    newPlatformUrl,
    setNewPlatformUrl,
    newPlatformDescription,
    setNewPlatformDescription,
    handleAddPlatform,
    closeAddPlatform,

    // Edit-platform dialog
    showEditPlatform,
    setShowEditPlatform,
    isEditPlatformClosing,
    editingPlatformId,
    editPlatformName,
    setEditPlatformName,
    editPlatformUrl,
    setEditPlatformUrl,
    editPlatformDescription,
    setEditPlatformDescription,
    handleStartEditPlatform,
    handleSaveEditPlatform,
    handleDeletePlatform,
    closeEditPlatform,

    // Add-model dialog
    showAddModel,
    setShowAddModel,
    isAddModelClosing,
    newModelId,
    setNewModelId,
    newModelName,
    setNewModelName,
    handleAddModel,
    closeAddModel,

    // Edit-model dialog
    showEditModel,
    setShowEditModel,
    isEditModelClosing,
    editingModel,
    editModelId,
    setEditModelId,
    editModelName,
    setEditModelName,
    handleEditModel,
    handleSaveEditModel,
    closeEditModel,

    // API key visibility
    showApiKey,
    setShowApiKey,

    // API testing
    testingModelId,
    handleTestModel,

    // Model management
    handleSelectModel,
    handleDeleteModel,
    handleCopyModel,

    // Refactored handlers for Context Menu
    handleTestModelClick,
    handleDeleteModelClick,
    handlePlatformEdit,
    handlePlatformDelete,
  };
}
