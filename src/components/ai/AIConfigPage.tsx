import React, { useEffect, useState } from 'react';
import { InformationLine } from '@mingcute/react';
import { useAIConfigStore } from '../../features/ai/store';
import { useAIConfig } from '../../features/ai/useAIConfig';
import { AppPageHeader } from '../shell/AppPageHeader';
import { ProviderIcon } from './ProviderIcon';
import {
  AI_API_ENDPOINT_EXAMPLES,
  AI_API_GUIDE,
  AI_MODEL_ID_EXAMPLES,
} from './apiGuide';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ProviderSidebar } from './ProviderSidebar';
import { ApiConfigFields } from './ApiConfigFields';
import { ModelManager } from './ModelManager';
import { PlatformDialogs } from './PlatformDialogs';
import { ModelDialogs } from './ModelDialogs';
import { RemoteModelDialog } from './RemoteModelDialog';

interface AIConfigPageProps {
  isActive: boolean;
  onBack: () => void;
}

export const AIConfigPage: React.FC<AIConfigPageProps> = ({ isActive, onBack }) => {
  const { providers, updateProviders } = useAIConfigStore();
  const [showApiGuide, setShowApiGuide] = useState(false);

  const config = useAIConfig({ providers, updateProviders });

  const {
    selectedProviderId, setSelectedProviderId, selectedProvider,
    handleToggleProvider, handleUpdateProvider,
    showAddPlatform, setShowAddPlatform, isAddPlatformClosing,
    newPlatformName, setNewPlatformName,
    newPlatformUrl, setNewPlatformUrl,
    newPlatformDescription, setNewPlatformDescription,
    newPlatformIconKey, setNewPlatformIconKey,
    addPlatformErrors,
    handleAddPlatform, closeAddPlatform,
    showEditPlatform, isEditPlatformClosing,
    editPlatformName, setEditPlatformName,
    editPlatformUrl, setEditPlatformUrl,
    editPlatformErrors,
    editPlatformDescription, setEditPlatformDescription,
    editPlatformIconKey, setEditPlatformIconKey,
    handleSaveEditPlatform, closeEditPlatform,
    showAddModel, setShowAddModel, isAddModelClosing,
    newModelId, setNewModelId, newModelName, setNewModelName,
    handleAddModel, closeAddModel,
    showEditModel, isEditModelClosing,
    editModelId, setEditModelId, editModelName, setEditModelName,
    handleEditModel, handleSaveEditModel, closeEditModel,
    showApiKey, setShowApiKey,
    handleTestModelClick,
    handleDeleteModelClick,
    handlePlatformEdit,
    handlePlatformDelete,
    
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
  } = config;

  useEffect(() => {
    if (isActive) return;
    setShowApiGuide(false);
    resetTransientState();
  }, [isActive, resetTransientState]);

  const handleBack = () => {
    setShowApiGuide(false);
    resetTransientState();
    onBack();
  };

  const apiGuideAction = (
    <Popover open={showApiGuide} onOpenChange={setShowApiGuide}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-sm text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text transition-colors"
          title="API 配置指南"
          aria-label="API 配置指南"
        >
          <InformationLine className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-96 p-0 z-[10000]">
        <div className="p-4 space-y-3 text-xs">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">支持的 API 类型</div>
          <div className="leading-5 text-gray-600 dark:text-gray-300">{AI_API_GUIDE.supportedProtocol}</div>
          <div className="leading-5 text-gray-600 dark:text-gray-300">{AI_API_GUIDE.baseUrlRule}</div>
          <div className="leading-5 text-gray-600 dark:text-gray-300">{AI_API_GUIDE.authRule}</div>
          <div className="leading-5 text-gray-500 dark:text-gray-400">{AI_API_GUIDE.unsupportedRule}</div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-border space-y-1">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">端点示例</div>
            {AI_API_ENDPOINT_EXAMPLES.map(example => (
              <div key={example.provider} className="grid grid-cols-[5rem_1fr] gap-2">
                <span className="text-gray-400 dark:text-gray-500 truncate">{example.provider}</span>
                <code className="select-text break-all font-mono text-[11px] text-gray-600 dark:text-gray-300">{example.url}</code>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-border space-y-1">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">模型 ID 示例</div>
            <div className="text-gray-600 dark:text-gray-300">{AI_MODEL_ID_EXAMPLES.join('、')}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden text-gray-800 dark:text-gray-100 select-none relative bg-ui-app"
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        const isModelCard = target.closest('[data-model-card]');
        if (!isInputElement && !isModelCard) {
          e.preventDefault();
        }
      }}
    >
      <AppPageHeader
        title="AI 配置"
        onBack={handleBack}
        isActive={isActive}
        actions={apiGuideAction}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ProviderSidebar
          providers={providers}
          selectedProviderId={selectedProviderId}
          onSelectProvider={setSelectedProviderId}
          onToggleProvider={handleToggleProvider}
          onAddPlatform={() => setShowAddPlatform(true)}
          onPlatformEdit={handlePlatformEdit}
          onPlatformDelete={handlePlatformDelete}
        />

        <div className="relative flex-1 flex flex-col bg-white dark:bg-dark-surface">
          {selectedProvider ? (
            <>
              <div className="px-6 pb-2 pt-4 shrink-0">
                <div className="flex items-center gap-2">
                  <ProviderIcon
                    providerId={selectedProvider.id}
                    name={selectedProvider.name}
                    iconKey={selectedProvider.iconKey}
                    size={24}
                  />
                  <h3 className="ui-page-title">{selectedProvider.name}</h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2 space-y-6">
                {selectedProvider.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedProvider.description}
                  </div>
                )}

                <ApiConfigFields
                  provider={selectedProvider}
                  onUpdate={handleUpdateProvider}
                  showApiKey={showApiKey}
                  onToggleShowApiKey={() => setShowApiKey(!showApiKey)}
                />

                <ModelManager
                  provider={selectedProvider}
                  onAddModel={() => setShowAddModel(true)}
                  onFetchRemoteModels={handleOpenRemoteModels}
                  onTestModel={handleTestModelClick}
                  onEditModel={handleEditModel}
                  onCopyModel={config.handleCopyModel}
                  onDeleteModel={handleDeleteModelClick}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              请选择左侧平台进行配置
            </div>
          )}
        </div>
      </div>

      <PlatformDialogs
        showAddPlatform={showAddPlatform}
        isAddPlatformClosing={isAddPlatformClosing}
        closeAddPlatform={closeAddPlatform}
        handleAddPlatform={handleAddPlatform}
        newPlatformName={newPlatformName}
        setNewPlatformName={setNewPlatformName}
        newPlatformUrl={newPlatformUrl}
        setNewPlatformUrl={setNewPlatformUrl}
        newPlatformDescription={newPlatformDescription}
        setNewPlatformDescription={setNewPlatformDescription}
        newPlatformIconKey={newPlatformIconKey}
        setNewPlatformIconKey={setNewPlatformIconKey}
        addPlatformErrors={addPlatformErrors}
        showEditPlatform={showEditPlatform}
        isEditPlatformClosing={isEditPlatformClosing}
        closeEditPlatform={closeEditPlatform}
        handleSaveEditPlatform={handleSaveEditPlatform}
        editPlatformName={editPlatformName}
        setEditPlatformName={setEditPlatformName}
        editPlatformUrl={editPlatformUrl}
        setEditPlatformUrl={setEditPlatformUrl}
        editPlatformDescription={editPlatformDescription}
        setEditPlatformDescription={setEditPlatformDescription}
        editPlatformIconKey={editPlatformIconKey}
        setEditPlatformIconKey={setEditPlatformIconKey}
        editPlatformErrors={editPlatformErrors}
      />

      <ModelDialogs
        showAddModel={showAddModel}
        isAddModelClosing={isAddModelClosing}
        closeAddModel={closeAddModel}
        handleAddModel={handleAddModel}
        newModelId={newModelId}
        setNewModelId={setNewModelId}
        newModelName={newModelName}
        setNewModelName={setNewModelName}
        showEditModel={showEditModel}
        isEditModelClosing={isEditModelClosing}
        closeEditModel={closeEditModel}
        handleSaveEditModel={handleSaveEditModel}
        editModelId={editModelId}
        setEditModelId={setEditModelId}
        editModelName={editModelName}
        setEditModelName={setEditModelName}
      />

      {selectedProvider && (
        <RemoteModelDialog
          show={showRemoteModels}
          isClosing={isRemoteModelsClosing}
          onClose={closeRemoteModels}
          providerName={selectedProvider.name}
          loading={remoteModelsLoading}
          error={remoteModelsError}
          remoteModels={remoteModels}
          existingModelIds={selectedProvider.models.map(m => m.id)}
          search={remoteModelsSearch}
          onSearchChange={setRemoteModelsSearch}
          onRefresh={handleFetchRemoteModels}
          onAddOne={handleAddRemoteModel}
          onRemoveOne={config.handleDeleteModel}
          onAddAll={handleAddAllRemoteModels}
        />
      )}

    </div>
  );
};
