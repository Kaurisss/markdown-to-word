import React from 'react';
import { AddLine, Edit2Line, Delete2Line, Back2Line } from '@mingcute/react';
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
  onBack: () => void;
}

export const ProviderSidebar: React.FC<ProviderSidebarProps> = ({
  providers,
  selectedProviderId,
  onSelectProvider,
  onToggleProvider,
  onAddPlatform,
  onPlatformEdit,
  onPlatformDelete,
  onBack,
}) => (
  <aside className="w-52 shrink-0 bg-[#fafafa] dark:bg-dark-bg/65 border-r border-gray-200/50 dark:border-dark-border flex flex-col pt-10">
    {/* 标题 */}
    <div className="px-5 pt-3 pb-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0 flex items-center justify-between">
      <span>AI 平台</span>
      <button
        onClick={onAddPlatform}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-element text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all cursor-pointer"
        title="添加自定义平台"
      >
        <AddLine className="w-3.5 h-3.5" />
      </button>
    </div>

    {/* 列表 */}
    <nav className="px-2 py-1 space-y-0.5 flex-1 overflow-y-auto">
      {providers.map(provider => {
        const isSelected = selectedProviderId === provider.id;
        const card = (
          <div
            key={provider.id}
            data-platform-card={provider.isCustom ? 'true' : undefined}
            onClick={() => onSelectProvider(provider.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
              isSelected
                ? 'bg-gray-200/60 dark:bg-dark-element text-gray-900 dark:text-gray-100 font-medium'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element/40'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 pr-2">
              <ProviderIcon
                providerId={provider.id}
                name={provider.name}
                iconKey={provider.iconKey}
                size={16}
              />
              <span className="truncate text-[13px]">{provider.name}</span>
            </span>
            <Switch
              checked={provider.isEnabled}
              onCheckedChange={(c) => onToggleProvider(provider.id, c)}
              onClick={(e) => e.stopPropagation()}
              size="sm"
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
    </nav>
  </aside>
);
