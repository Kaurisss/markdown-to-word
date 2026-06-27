import React from 'react';
import { AddLine, Edit2Line, Delete2Line, BrainLine } from '@mingcute/react';
import { AIProvider } from '../../types/ai';
import { Switch } from '../ui/switch';
import { ProviderIcon } from './ProviderIcon';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

interface ProviderSidebarProps {
  providers: AIProvider[];
  selectedProviderId: string;
  onSelectProvider: (id: string) => void;
  onToggleProvider: (id: string, checked: boolean) => void;
  onAddPlatform: () => void;
  onPlatformEdit: (provider: AIProvider) => void;
  onPlatformDelete: (provider: AIProvider) => void;
}

export const ProviderSidebar: React.FC<ProviderSidebarProps> = ({
  providers,
  selectedProviderId,
  onSelectProvider,
  onToggleProvider,
  onAddPlatform,
  onPlatformEdit,
  onPlatformDelete,
}) => (
  <div className="w-64 shrink-0 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col relative z-40">
    <div className="h-12 px-5 flex items-center justify-between shrink-0 relative">
      <div className="absolute inset-0 z-0" data-tauri-drag-region />
      <h2 className="ui-sidebar-kicker relative z-10 pointer-events-none flex items-center gap-1.5">
        <BrainLine className="w-4 h-4" />
        AI 平台管理
      </h2>
      <button
        onClick={onAddPlatform}
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
            onClick={() => onSelectProvider(provider.id)}
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
              onCheckedChange={(c) => onToggleProvider(provider.id, c)}
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
              <ContextMenuItem onClick={() => onPlatformEdit(provider)}>
                <Edit2Line className="w-4 h-4 mr-2" /> 编辑
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onPlatformDelete(provider)} className="text-red-500 hover:text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:focus:text-red-300">
                <Delete2Line className="w-4 h-4 mr-2" /> 删除
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  </div>
);
