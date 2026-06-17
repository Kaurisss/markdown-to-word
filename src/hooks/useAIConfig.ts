import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AIProvider, AIModel } from '../interfaces/AI';
import { toast } from 'sonner';
import {
  EMPTY_PROVIDER_FORM,
  EMPTY_MODEL_FORM,
  ProviderFormValues,
  ModelFormValues,
  buildCustomProvider,
  buildModel,
  patchCustomProvider,
  providerFormSchema,
  modelFormSchema,
  toProviderFormValues,
} from '../services/aiConfigValidation';

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
  const addPlatformForm = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: EMPTY_PROVIDER_FORM,
    mode: 'onSubmit',
  });

  // ── Edit-platform dialog ────────────────────────────────────────────
  const [showEditPlatform, setShowEditPlatform] = useState(false);
  const [isEditPlatformClosing, setIsEditPlatformClosing] = useState(false);
  const [editingPlatformId, setEditingPlatformId] = useState('');
  const editPlatformForm = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: EMPTY_PROVIDER_FORM,
    mode: 'onSubmit',
  });

  const newPlatformName = addPlatformForm.watch('name');
  const newPlatformUrl = addPlatformForm.watch('baseUrl');
  const newPlatformDescription = addPlatformForm.watch('description');
  const editPlatformName = editPlatformForm.watch('name');
  const editPlatformUrl = editPlatformForm.watch('baseUrl');
  const editPlatformDescription = editPlatformForm.watch('description');

  const setNewPlatformName = useCallback((value: string) => {
    addPlatformForm.setValue('name', value, { shouldDirty: true, shouldValidate: false });
  }, [addPlatformForm]);
  const setNewPlatformUrl = useCallback((value: string) => {
    addPlatformForm.setValue('baseUrl', value, { shouldDirty: true, shouldValidate: false });
  }, [addPlatformForm]);
  const setNewPlatformDescription = useCallback((value: string) => {
    addPlatformForm.setValue('description', value, { shouldDirty: true, shouldValidate: false });
  }, [addPlatformForm]);
  const setEditPlatformName = useCallback((value: string) => {
    editPlatformForm.setValue('name', value, { shouldDirty: true, shouldValidate: false });
  }, [editPlatformForm]);
  const setEditPlatformUrl = useCallback((value: string) => {
    editPlatformForm.setValue('baseUrl', value, { shouldDirty: true, shouldValidate: false });
  }, [editPlatformForm]);
  const setEditPlatformDescription = useCallback((value: string) => {
    editPlatformForm.setValue('description', value, { shouldDirty: true, shouldValidate: false });
  }, [editPlatformForm]);

  // ── Add-model dialog ────────────────────────────────────────────────
  const [showAddModel, setShowAddModel] = useState(false);
  const [isAddModelClosing, setIsAddModelClosing] = useState(false);
  const addModelForm = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: EMPTY_MODEL_FORM,
    mode: 'onSubmit',
  });

  // ── Edit-model dialog ───────────────────────────────────────────────
  const [showEditModel, setShowEditModel] = useState(false);
  const [isEditModelClosing, setIsEditModelClosing] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const editModelForm = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: EMPTY_MODEL_FORM,
    mode: 'onSubmit',
  });

  const newModelId = addModelForm.watch('id');
  const newModelName = addModelForm.watch('name');
  const editModelId = editModelForm.watch('id');
  const editModelName = editModelForm.watch('name');

  const setNewModelId = useCallback((value: string) => {
    addModelForm.setValue('id', value, { shouldDirty: true, shouldValidate: false });
  }, [addModelForm]);
  const setNewModelName = useCallback((value: string) => {
    addModelForm.setValue('name', value, { shouldDirty: true, shouldValidate: false });
  }, [addModelForm]);
  const setEditModelId = useCallback((value: string) => {
    editModelForm.setValue('id', value, { shouldDirty: true, shouldValidate: false });
  }, [editModelForm]);
  const setEditModelName = useCallback((value: string) => {
    editModelForm.setValue('name', value, { shouldDirty: true, shouldValidate: false });
  }, [editModelForm]);

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
      addPlatformForm.reset(EMPTY_PROVIDER_FORM);
    }, 200);
  }, [addPlatformForm]);

  const closeEditPlatform = useCallback(() => {
    setIsEditPlatformClosing(true);
    setTimeout(() => {
      setShowEditPlatform(false);
      setIsEditPlatformClosing(false);
      setEditingPlatformId('');
      editPlatformForm.reset(EMPTY_PROVIDER_FORM);
    }, 200);
  }, [editPlatformForm]);

  const closeAddModel = useCallback(() => {
    setIsAddModelClosing(true);
    setTimeout(() => {
      setShowAddModel(false);
      setIsAddModelClosing(false);
      addModelForm.reset(EMPTY_MODEL_FORM);
    }, 200);
  }, [addModelForm]);

  const closeEditModel = useCallback(() => {
    setIsEditModelClosing(true);
    setTimeout(() => {
      setShowEditModel(false);
      setIsEditModelClosing(false);
      setEditingModel(null);
      editModelForm.reset(EMPTY_MODEL_FORM);
    }, 200);
  }, [editModelForm]);

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

  const handleAddModel = addModelForm.handleSubmit((values) => {
    if (!selectedProvider) return;
    const model = buildModel(values);
    handleUpdateProvider(selectedProvider.id, {
      models: [...selectedProvider.models, model],
    });
    closeAddModel();
    addModelForm.reset(EMPTY_MODEL_FORM);
  });

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

  const handleSaveEditModel = editModelForm.handleSubmit((values) => {
    if (!selectedProvider || !editingModel) return;
    const normalizedModel = buildModel(values);
    const updatedModels = selectedProvider.models.map(m =>
      m.id === editingModel.id ? normalizedModel : m,
    );
    handleUpdateProvider(selectedProvider.id, { models: updatedModels });
    closeEditModel();
    editModelForm.reset(EMPTY_MODEL_FORM);
  });

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

  const handleAddPlatform = addPlatformForm.handleSubmit((values) => {
    const newId = `custom-${Date.now()}`;
    const provider = buildCustomProvider({ id: newId, values });
    updateProviders([...providers, provider]);
    setSelectedProviderId(newId);
    closeAddPlatform();
    addPlatformForm.reset(EMPTY_PROVIDER_FORM);
  });

  const handleStartEditPlatform = useCallback((provider: AIProvider) => {
    if (!provider.isCustom) return;
    setEditingPlatformId(provider.id);
    editPlatformForm.reset(toProviderFormValues(provider));
    setShowEditPlatform(true);
  }, [editPlatformForm]);

  const handleSaveEditPlatform = editPlatformForm.handleSubmit((values) => {
    if (!editingPlatformId) return;
    handleUpdateProvider(editingPlatformId, patchCustomProvider(values));
    closeEditPlatform();
    editPlatformForm.reset(EMPTY_PROVIDER_FORM);
  });

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
    editModelForm.reset({ id: model.id, name: model.name });
    setShowEditModel(true);
  }, [editModelForm]);

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
