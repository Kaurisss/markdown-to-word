import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { AIProvider, AIModel } from '../interfaces/AI';
import { useInputContextMenu } from './useInputContextMenu';

export interface UseAIConfigParams {
  providers: AIProvider[];
  updateProviders: (providers: AIProvider[]) => void;
  selectedModel: { providerId: string; modelId: string } | null;
  updateSelectedModel: (model: { providerId: string; modelId: string } | null) => void;
}

export interface TestResult {
  status: 'success' | 'error';
  message: string;
  time?: number;
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
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  // ── Model context menu ──────────────────────────────────────────────
  const [modelContextMenu, setModelContextMenu] = useState<{
    visible: boolean; x: number; y: number; model: AIModel | null;
  }>({ visible: false, x: 0, y: 0, model: null });
  const modelContextMenuRef = useRef<HTMLDivElement | null>(null);

  // ── Platform context menu ───────────────────────────────────────────
  const [platformContextMenu, setPlatformContextMenu] = useState<{
    visible: boolean; x: number; y: number; provider: AIProvider | null;
  }>({ visible: false, x: 0, y: 0, provider: null });
  const platformContextMenuRef = useRef<HTMLDivElement | null>(null);

  // ── Input context menu ──────────────────────────────────────────────
  const {
    contextMenu: inputContextMenu,
    handleInputContextMenu,
    closeContextMenu: closeInputContextMenu,
  } = useInputContextMenu();

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

  const closeModelContextMenu = useCallback(() => {
    setModelContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const closePlatformContextMenu = useCallback(() => {
    setPlatformContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

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

  const handleTestModel = useCallback(async (modelId: string) => {
    if (!selectedProvider) return;
    if (!selectedProvider.apiKey) {
      setTestResults(prev => ({
        ...prev,
        [modelId]: { status: 'error', message: '请先配置 API Key' },
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

      setTestResults(prev => ({
        ...prev,
        [modelId]: { status: 'success', message: '测试成功', time: duration },
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '连接失败';
      setTestResults(prev => ({
        ...prev,
        [modelId]: { status: 'error', message: msg },
      }));
    } finally {
      setTestingModelId(null);
    }
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

  const handleCopyModel = useCallback(() => {
    if (!selectedProvider || !modelContextMenu.model) return;
    const original = modelContextMenu.model;
    const model: AIModel = {
      id: `${original.id}-copy`,
      name: `${original.name} (副本)`,
    };
    handleUpdateProvider(selectedProvider.id, {
      models: [...selectedProvider.models, model],
    });
    closeModelContextMenu();
  }, [selectedProvider, modelContextMenu.model, handleUpdateProvider, closeModelContextMenu]);

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

  // ── Context-menu action handlers ────────────────────────────────────

  const handleModelContextMenu = useCallback((e: React.MouseEvent, model: AIModel) => {
    e.preventDefault();
    e.stopPropagation();
    setModelContextMenu({ visible: true, x: e.clientX, y: e.clientY, model });
  }, []);

  const handleEditModel = useCallback(() => {
    if (!modelContextMenu.model) return;
    setEditingModel(modelContextMenu.model);
    setEditModelId(modelContextMenu.model.id);
    setEditModelName(modelContextMenu.model.name);
    setShowEditModel(true);
    closeModelContextMenu();
  }, [modelContextMenu.model, closeModelContextMenu]);

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

  const handlePlatformContextMenu = useCallback((e: React.MouseEvent, provider: AIProvider) => {
    if (!provider.isCustom) return;
    e.preventDefault();
    e.stopPropagation();
    setPlatformContextMenu({ visible: true, x: e.clientX, y: e.clientY, provider });
  }, []);

  const handlePlatformContextEdit = useCallback(() => {
    if (!platformContextMenu.provider) return;
    handleStartEditPlatform(platformContextMenu.provider);
    closePlatformContextMenu();
  }, [platformContextMenu.provider, handleStartEditPlatform, closePlatformContextMenu]);

  const handlePlatformContextDelete = useCallback(() => {
    if (!platformContextMenu.provider) return;
    handleDeletePlatform(platformContextMenu.provider);
    closePlatformContextMenu();
  }, [platformContextMenu.provider, handleDeletePlatform, closePlatformContextMenu]);

  // ── Dismiss context menus on outside click ──────────────────────────

  useEffect(() => {
    const handleClick = () => {
      if (modelContextMenu.visible) closeModelContextMenu();
      if (platformContextMenu.visible) closePlatformContextMenu();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [modelContextMenu.visible, closeModelContextMenu, platformContextMenu.visible, closePlatformContextMenu]);

  // ── Keep context menus within viewport ──────────────────────────────

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

  useLayoutEffect(() => {
    if (!platformContextMenu.visible) return;
    requestAnimationFrame(() => {
      if (!platformContextMenuRef.current) return;
      const { offsetWidth, offsetHeight } = platformContextMenuRef.current;
      const padding = 8;
      const maxX = window.innerWidth - offsetWidth - padding;
      const maxY = window.innerHeight - offsetHeight - padding;
      const nextX = Math.max(padding, Math.min(platformContextMenu.x, maxX));
      const nextY = Math.max(padding, Math.min(platformContextMenu.y, maxY));
      if (nextX !== platformContextMenu.x || nextY !== platformContextMenu.y) {
        setPlatformContextMenu(prev => prev.visible ? { ...prev, x: nextX, y: nextY } : prev);
      }
    });
  }, [platformContextMenu.visible, platformContextMenu.x, platformContextMenu.y]);

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
    testResults,
    handleTestModel,

    // Model management
    handleSelectModel,
    handleDeleteModel,
    handleCopyModel,

    // Model context menu
    modelContextMenu,
    modelContextMenuRef,
    handleModelContextMenu,
    closeModelContextMenu,
    handleContextMenuTest,
    handleContextMenuDelete,

    // Platform context menu
    platformContextMenu,
    platformContextMenuRef,
    handlePlatformContextMenu,
    closePlatformContextMenu,
    handlePlatformContextEdit,
    handlePlatformContextDelete,

    // Input context menu
    inputContextMenu,
    handleInputContextMenu,
    closeInputContextMenu,
  };
}
