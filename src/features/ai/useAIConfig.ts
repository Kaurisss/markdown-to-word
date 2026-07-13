import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AIProvider, AIModel } from '../../types/ai';
import { toast } from 'sonner';
import { testApiConnection, fetchRemoteModels, RemoteModel } from './aiApi';
import { updateProviderInList, toggleProviderInList } from './providerActions';
import { addModelToProvider, deleteModelFromProvider, saveEditedModelInProvider, copyModelInProvider, addMultipleModelsToProvider } from './modelActions';
import {
  EMPTY_PROVIDER_FORM,
  EMPTY_MODEL_FORM,
  ProviderFormValues,
  ModelFormValues,
  buildCustomProvider,
  patchCustomProvider,
  providerFormSchema,
  modelFormSchema,
  toProviderFormValues,
} from './validation';

export interface UseAIConfigParams {
  providers: AIProvider[];
  updateProviders: (providers: AIProvider[]) => void;
}


export function useAIConfig({
  providers,
  updateProviders,
}: UseAIConfigParams) {
  // ── Provider selection ──────────────────────────────────────────────
  const [selectedProviderId, setSelectedProviderId] = useState<string>(() => providers[0]?.id ?? '');

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
  const newPlatformIconKey = addPlatformForm.watch('iconKey');
  const editPlatformName = editPlatformForm.watch('name');
  const editPlatformUrl = editPlatformForm.watch('baseUrl');
  const editPlatformDescription = editPlatformForm.watch('description');
  const editPlatformIconKey = editPlatformForm.watch('iconKey');

  const setNewPlatformName = useCallback((value: string) => {
    addPlatformForm.setValue('name', value, { shouldDirty: true, shouldValidate: false });
  }, [addPlatformForm]);
  const setNewPlatformUrl = useCallback((value: string) => {
    addPlatformForm.setValue('baseUrl', value, { shouldDirty: true, shouldValidate: false });
  }, [addPlatformForm]);
  const setNewPlatformDescription = useCallback((value: string) => {
    addPlatformForm.setValue('description', value, { shouldDirty: true, shouldValidate: false });
  }, [addPlatformForm]);
  const setNewPlatformIconKey = useCallback((value: string) => {
    addPlatformForm.setValue('iconKey', value, { shouldDirty: true, shouldValidate: false });
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
  const setEditPlatformIconKey = useCallback((value: string) => {
    editPlatformForm.setValue('iconKey', value, { shouldDirty: true, shouldValidate: false });
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

  // ── Remote models dialog ─────────────────────────────────────────────
  const [showRemoteModels, setShowRemoteModels] = useState(false);
  const [isRemoteModelsClosing, setIsRemoteModelsClosing] = useState(false);
  const [remoteModels, setRemoteModels] = useState<RemoteModel[]>([]);
  const [remoteModelsLoading, setRemoteModelsLoading] = useState(false);
  const [remoteModelsError, setRemoteModelsError] = useState<string | null>(null);
  const [remoteModelsSearch, setRemoteModelsSearch] = useState('');

  // ── Derived values ──────────────────────────────────────────────────
  const selectedProvider = providers.find(p => p.id === selectedProviderId) ?? providers[0];

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

  const closeRemoteModels = useCallback(() => {
    setIsRemoteModelsClosing(true);
    setTimeout(() => {
      setShowRemoteModels(false);
      setIsRemoteModelsClosing(false);
      setRemoteModels([]);
      setRemoteModelsSearch('');
      setRemoteModelsError(null);
    }, 200);
  }, []);

  const resetTransientState = useCallback(() => {
    setShowAddPlatform(false);
    setIsAddPlatformClosing(false);
    addPlatformForm.reset(EMPTY_PROVIDER_FORM);

    setShowEditPlatform(false);
    setIsEditPlatformClosing(false);
    setEditingPlatformId('');
    editPlatformForm.reset(EMPTY_PROVIDER_FORM);

    setShowAddModel(false);
    setIsAddModelClosing(false);
    addModelForm.reset(EMPTY_MODEL_FORM);

    setShowEditModel(false);
    setIsEditModelClosing(false);
    setEditingModel(null);
    editModelForm.reset(EMPTY_MODEL_FORM);

    setShowApiKey(false);
    setShowRemoteModels(false);
    setIsRemoteModelsClosing(false);
    setRemoteModels([]);
    setRemoteModelsSearch('');
    setRemoteModelsError(null);
  }, [addModelForm, addPlatformForm, editModelForm, editPlatformForm]);

  // ── Core provider helpers ───────────────────────────────────────────

  const handleUpdateProvider = useCallback((id: string, patch: Partial<AIProvider>) => {
    updateProviders(updateProviderInList(providers, id, patch));
  }, [providers, updateProviders]);

  const handleToggleProvider = useCallback((id: string, checked: boolean) => {
    updateProviders(toggleProviderInList(providers, id, checked));
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
      try {
        return await testApiConnection({
          baseUrl: selectedProvider.baseUrl,
          apiKey: selectedProvider.apiKey,
          modelId,
        });
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

  const handleAddModel = addModelForm.handleSubmit((values) => {
    if (!selectedProvider) return;
    updateProviders(addModelToProvider(providers, selectedProvider.id, values));
    closeAddModel();
    addModelForm.reset(EMPTY_MODEL_FORM);
  });

  const handleDeleteModel = useCallback((modelId: string) => {
    if (!selectedProvider) return;
    updateProviders(deleteModelFromProvider(providers, selectedProvider.id, modelId));
  }, [selectedProvider, providers, updateProviders]);

  const handleSaveEditModel = editModelForm.handleSubmit((values) => {
    if (!selectedProvider || !editingModel) return;
    updateProviders(saveEditedModelInProvider(providers, selectedProvider.id, editingModel.id, values));
    closeEditModel();
    editModelForm.reset(EMPTY_MODEL_FORM);
  });

  const handleCopyModel = useCallback((model: AIModel) => {
    if (!selectedProvider) return;
    updateProviders(copyModelInProvider(providers, selectedProvider.id, model));
  }, [selectedProvider, providers, updateProviders]);

  const handleFetchRemoteModels = useCallback(async () => {
    if (!selectedProvider) return;
    if (!selectedProvider.apiKey) {
      toast.error('配置错误', { description: '请先配置 API Key' });
      return;
    }
    setRemoteModelsLoading(true);
    setRemoteModelsError(null);
    try {
      const models = await fetchRemoteModels({
        baseUrl: selectedProvider.baseUrl,
        apiKey: selectedProvider.apiKey,
      });
      setRemoteModels(models);
    } catch (err) {
      setRemoteModelsError(err instanceof Error ? err.message : '获取失败');
    } finally {
      setRemoteModelsLoading(false);
    }
  }, [selectedProvider]);

  const handleOpenRemoteModels = useCallback(() => {
    if (!selectedProvider) return;
    if (!selectedProvider.apiKey) {
      toast.error('配置错误', { description: '请先配置 API Key 才能获取模型列表' });
      return;
    }
    setShowRemoteModels(true);
    setRemoteModelsSearch('');
    handleFetchRemoteModels();
  }, [selectedProvider, handleFetchRemoteModels]);

  const handleAddRemoteModel = useCallback((modelId: string) => {
    if (!selectedProvider) return;
    updateProviders(addMultipleModelsToProvider(providers, selectedProvider.id, [{ id: modelId, name: modelId }]));
  }, [selectedProvider, providers, updateProviders]);

  const handleAddAllRemoteModels = useCallback((filteredModels: {id: string}[]) => {
    if (!selectedProvider) return;
    const modelsToAdd = filteredModels.map(m => ({ id: m.id, name: m.id }));
    updateProviders(addMultipleModelsToProvider(providers, selectedProvider.id, modelsToAdd));
  }, [selectedProvider, providers, updateProviders]);

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
  }, [providers, selectedProviderId, updateProviders]);

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
    newPlatformIconKey,
    setNewPlatformIconKey,
    addPlatformErrors: addPlatformForm.formState.errors,
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
    editPlatformIconKey,
    setEditPlatformIconKey,
    editPlatformErrors: editPlatformForm.formState.errors,
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
    handleDeleteModel,
    handleCopyModel,

    // Remote models dialog
    showRemoteModels,
    isRemoteModelsClosing,
    closeRemoteModels,
    remoteModels,
    remoteModelsLoading,
    remoteModelsError,
    remoteModelsSearch,
    setRemoteModelsSearch,
    handleOpenRemoteModels,
    handleFetchRemoteModels,
    handleAddRemoteModel,
    handleAddAllRemoteModels,
    resetTransientState,

    // Refactored handlers for Context Menu
    handleTestModelClick,
    handleDeleteModelClick,
    handlePlatformEdit,
    handlePlatformDelete,
  };
}
