import React, { useState } from 'react';
import { Copy2Line, AddLine, PlayLine, Delete2Line, Edit2Line, Eye2Line, EyeCloseLine, Key2Line, Link2Line, InformationLine, AiLine } from '@mingcute/react';
import { useAIConfigStore } from '../../features/ai/store';
import { useAIConfig } from '../../features/ai/useAIConfig';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useShowWindowAfterFirstRender } from '../shell/useShowWindowAfterFirstRender';
import { WindowTitleBar } from '../shell/WindowTitleBar';
import { ProviderIcon } from './ProviderIcon';
import { ProviderIconPicker } from './ProviderIconPicker';
import {
  AI_API_ENDPOINT_EXAMPLES,
  AI_API_GUIDE,
  AI_MODEL_ID_EXAMPLES,
  PROVIDER_CONSOLE_URLS,
} from './apiGuide';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut
} from '@/components/ui/context-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const AIConfigWindow: React.FC = () => {
  const { providers, updateProviders } = useAIConfigStore();
  useShowWindowAfterFirstRender();
  const [showApiGuide, setShowApiGuide] = useState(false);

  const config = useAIConfig({
    providers,
    updateProviders,
  });

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
    testingModelId,
    handleTestModelClick,
    handleDeleteModelClick,
    handlePlatformEdit,
    handlePlatformDelete,
  } = config;

  return (
    <div
      className="flex h-screen w-screen overflow-hidden text-gray-800 dark:text-gray-100 select-none relative"
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        const isModelCard = target.closest('[data-model-card]');
        if (!isInputElement && !isModelCard) {
          e.preventDefault();
        }
      }}
    >
      <WindowTitleBar />
      <div className="absolute top-0 right-12 z-[9999] flex items-center h-12">
        <Popover open={showApiGuide} onOpenChange={setShowApiGuide}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="API 配置指南"
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
      </div>

      {/* Left Categories */}
      <div className="w-64 shrink-0 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col relative z-40">
        <div className="h-12 px-5 flex items-center justify-between shrink-0 relative">
          <div className="absolute inset-0 z-0" data-tauri-drag-region />
          <h2 className="ui-sidebar-kicker relative z-10 pointer-events-none flex items-center gap-1.5">
            <AiLine className="w-4 h-4" />
            AI 平台管理
          </h2>
          <button
            onClick={() => setShowAddPlatform(true)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-surface text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors relative z-10"
            title="添加自定义平台"
          >
            <AddLine className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {providers.map(provider => {
            const card = (
              <div
                key={provider.id}
                data-platform-card={provider.isCustom ? 'true' : undefined}
                onClick={() => setSelectedProviderId(provider.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${selectedProviderId === provider.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-600 dark:text-brand-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
                  }`}
              >
                <span className="flex min-w-0 items-center gap-2 pr-2">
                  <ProviderIcon
                    providerId={provider.id}
                    name={provider.name}
                    iconKey={provider.iconKey}
                    size={18}
                  />
                  <span className="truncate">{provider.name}</span>
                </span>
                <Switch
                  checked={provider.isEnabled}
                  onCheckedChange={(c) => handleToggleProvider(provider.id, c)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );

            if (!provider.isCustom) return card;

            return (
              <ContextMenu key={provider.id}>
                <ContextMenuTrigger asChild>
                  {card}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => handlePlatformEdit(provider)}>
                    <Edit2Line className="w-4 h-4 mr-2" /> 编辑
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => handlePlatformDelete(provider)} className="text-red-500 hover:text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:focus:text-red-300">
                    <Delete2Line className="w-4 h-4 mr-2" /> 删除
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </div>

      {/* Right Content */}
      <div className="relative flex-1 flex flex-col bg-white dark:bg-dark-surface pt-12">
        {selectedProvider ? (
          <>
            <div className="px-6 pb-2 pt-2 shrink-0">
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
              {/* Description */}
              {selectedProvider.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedProvider.description}
                </div>
              )}

              {/* API Config */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="ui-section-title">
                    API 配置
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="ui-field-label">API Key</Label>
                    {PROVIDER_CONSOLE_URLS[selectedProvider.id] && (
                      <a
                        href={PROVIDER_CONSOLE_URLS[selectedProvider.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                        title="前往官网获取 API Key"
                      >
                        <Link2Line className="w-3.5 h-3.5" />
                        获取密钥
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Key2Line className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={selectedProvider.apiKey}
                      onChange={(e) => handleUpdateProvider(selectedProvider.id, { apiKey: e.target.value })}
                      className="w-full pl-9 pr-9 bg-white dark:bg-dark-element"
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
                  <Label className="ui-field-label">Base URL</Label>
                  <div className="relative">
                    <Link2Line className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={selectedProvider.baseUrl}
                      onChange={(e) => handleUpdateProvider(selectedProvider.id, { baseUrl: e.target.value })}
                      className="w-full pl-9 bg-white dark:bg-dark-element"
                      placeholder="https://api.example.com/..."
                    />
                  </div>

                </div>
              </div>

              {/* Model Management */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="ui-section-title">
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
                    return (
                      <ContextMenu key={model.id}>
                        <ContextMenuTrigger asChild>
                          <div
                            data-model-card
                            className="flex items-center justify-between p-3 rounded-lg border group transition-all bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-element-hover"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{model.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">右键菜单</span>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuItem onClick={() => handleTestModelClick(model)}>
                            <PlayLine className="w-4 h-4 mr-2" /> 测试连接
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleEditModel(model)}>
                            <Edit2Line className="w-4 h-4 mr-2" /> 编辑
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => config.handleCopyModel(model)}>
                            <Copy2Line className="w-4 h-4 mr-2" /> 复制配置
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => handleDeleteModelClick(model)} className="text-red-500 hover:text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:focus:text-red-300">
                            <Delete2Line className="w-4 h-4 mr-2" /> 删除
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
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

      {/* Add Platform Modal */}
      <Dialog open={showAddPlatform || isAddPlatformClosing} onOpenChange={(open) => { if (!open) closeAddPlatform(); }}>
        <DialogContent className="w-[420px] p-5 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-3">
            <DialogTitle className="text-sm font-semibold text-center text-gray-800 dark:text-gray-100">添加自定义平台</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Icon picker - centered, first row */}
            <div className="flex flex-col items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-element hover:bg-gray-100 dark:hover:bg-dark-element-hover transition-colors"
                  >
                    {newPlatformIconKey ? (
                      <ProviderIcon iconKey={newPlatformIconKey} name={newPlatformName} size={28} />
                    ) : (
                      <AddLine className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" side="bottom" className="w-80 p-3 z-[100000]">
                  <ProviderIconPicker
                    value={newPlatformIconKey}
                    onChange={setNewPlatformIconKey}
                    compact
                  />
                </PopoverContent>
              </Popover>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">选择图标</span>
            </div>
            {/* Platform Name */}
            <div className="space-y-1.5">
              <Label className="ui-field-label">平台名称</Label>
              <Input
                type="text"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                placeholder="例如：我的 AI 平台"
              />
            </div>
            {/* Base URL */}
            <div className="space-y-1.5">
              <Label className="ui-field-label">Base URL <span className="text-gray-400 font-normal">(可选)</span></Label>
              <Input
                type="text"
                value={newPlatformUrl}
                onChange={(e) => setNewPlatformUrl(e.target.value)}
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>
            {addPlatformErrors.baseUrl && (
              <p className="text-xs text-red-500">{addPlatformErrors.baseUrl.message}</p>
            )}
            {/* Description */}
            <div className="space-y-1.5">
              <Label className="ui-field-label">平台描述 <span className="text-gray-400 font-normal">(可选)</span></Label>
              <Input
                type="text"
                value={newPlatformDescription}
                onChange={(e) => setNewPlatformDescription(e.target.value)}
                placeholder="简要描述该平台"
              />
            </div>
            <div className="rounded-lg bg-gray-50 p-2.5 text-xs leading-5 text-gray-500 dark:bg-dark-element dark:text-gray-400">
              自定义平台需要提供 OpenAI 兼容的 Chat Completions 完整端点。留空时使用默认示例地址，之后仍可编辑。
            </div>
            <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
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
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Platform Modal */}
      <Dialog open={showEditPlatform || isEditPlatformClosing} onOpenChange={(open) => { if (!open) closeEditPlatform(); }}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">编辑平台</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="text"
              value={editPlatformName}
              onChange={(e) => setEditPlatformName(e.target.value)}
              placeholder="平台名称"
            />
            <ProviderIconPicker
              value={editPlatformIconKey}
              onChange={setEditPlatformIconKey}
            />
            <Input
              type="text"
              value={editPlatformUrl}
              onChange={(e) => setEditPlatformUrl(e.target.value)}
              placeholder="Base URL"
            />
            <div className="rounded-lg bg-gray-50 p-2 text-xs leading-5 text-gray-500 dark:bg-dark-element dark:text-gray-400">
              请填写完整请求地址，例如 {AI_API_ENDPOINT_EXAMPLES[0].url}。
            </div>
            {editPlatformErrors.baseUrl && (
              <p className="text-xs text-red-500">{editPlatformErrors.baseUrl.message}</p>
            )}
            <Input
              type="text"
              value={editPlatformDescription}
              onChange={(e) => setEditPlatformDescription(e.target.value)}
              placeholder="平台描述 (可选)"
            />
            <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
              <button
                onClick={closeEditPlatform}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-element-hover rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditPlatform}
                disabled={!editPlatformName.trim()}
                className="px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                保存
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Model Modal */}
      <Dialog open={showAddModel || isAddModelClosing} onOpenChange={(open) => { if (!open) closeAddModel(); }}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">添加模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="ui-field-label">模型 ID <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={newModelId}
                onChange={(e) => setNewModelId(e.target.value)}
                placeholder="例如: gpt-4o, qwen-plus"
                autoFocus
              />
            </div>
            <div className="text-xs leading-5 text-gray-400 dark:text-gray-500">
              填供应商要求的模型 ID，例如 {AI_MODEL_ID_EXAMPLES.slice(0, 3).join('、')}；显示名称可以自定义。
            </div>
            <div className="space-y-1">
              <Label className="ui-field-label">显示名称</Label>
              <Input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="留空则使用模型 ID"
              />
            </div>
            <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
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
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>


      {/* Edit Model Modal */}
      <Dialog open={showEditModel || isEditModelClosing} onOpenChange={(open) => { if (!open) closeEditModel(); }}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">编辑模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="ui-field-label">模型 ID <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={editModelId}
                onChange={(e) => setEditModelId(e.target.value)}
                placeholder="例如: gpt-4o, qwen-plus"
                autoFocus
              />
            </div>
            <div className="text-xs leading-5 text-gray-400 dark:text-gray-500">
              模型 ID 会直接发送给 API 的 model 字段；请与供应商控制台或文档保持一致。
            </div>
            <div className="space-y-1">
              <Label className="ui-field-label">显示名称</Label>
              <Input
                type="text"
                value={editModelName}
                onChange={(e) => setEditModelName(e.target.value)}
                placeholder="留空则使用模型 ID"
              />
            </div>
            <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
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
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* Input Context Menu */}
      <Toaster richColors position="top-center" closeButton />
    </div>
  );
};
