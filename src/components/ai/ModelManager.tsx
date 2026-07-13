import React from 'react';
import { AddLine, Copy2Line, PlayLine, Delete2Line, Edit2Line, DownloadLine } from '@mingcute/react';
import { AIModel, AIProvider } from '../../types/ai';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { SettingCard } from '../settings/SettingsLayout';

interface ModelManagerProps {
  provider: AIProvider;
  onAddModel: () => void;
  onFetchRemoteModels: () => void;
  onTestModel: (model: AIModel) => void;
  onEditModel: (model: AIModel) => void;
  onCopyModel: (model: AIModel) => void;
  onDeleteModel: (model: AIModel) => void;
}

export const ModelManager: React.FC<ModelManagerProps> = ({
  provider,
  onAddModel,
  onFetchRemoteModels,
  onTestModel,
  onEditModel,
  onCopyModel,
  onDeleteModel,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        模型管理
      </div>
      
      {/* 按钮行 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAddModel}
          className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 border border-brand-200/60 dark:border-brand-800/80 rounded-lg transition-colors cursor-pointer"
        >
          <AddLine className="w-3.5 h-3.5" />
          添加模型
        </button>
        <button
          onClick={onFetchRemoteModels}
          className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors cursor-pointer"
        >
          <DownloadLine className="w-3.5 h-3.5" />
          获取模型列表
        </button>
      </div>
    </div>

    {/* 模型卡片列表 */}
    <div className="space-y-2">
      {provider.models.length > 0 ? (
        <SettingCard>
          {provider.models.map(model => (
            <ContextMenu key={model.id}>
              <ContextMenuTrigger asChild>
                <div
                  data-model-card
                  className="flex items-center justify-between p-3.5 px-4 group hover:bg-gray-50/50 dark:hover:bg-dark-element/20 transition-all cursor-context-menu"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">{model.name}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 truncate">{model.id}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      右键管理
                    </span>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={() => onTestModel(model)}>
                  <PlayLine className="w-4 h-4 mr-2" /> 测试连接
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onEditModel(model)}>
                  <Edit2Line className="w-4 h-4 mr-2" /> 编辑名称
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onCopyModel(model)}>
                  <Copy2Line className="w-4 h-4 mr-2" /> 复制配置
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onDeleteModel(model)} className="text-red-500 hover:text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:focus:text-red-300">
                  <Delete2Line className="w-4 h-4 mr-2" /> 删除模型
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </SettingCard>
      ) : (
        <div className="text-center py-8 rounded-xl border border-dashed border-gray-200 dark:border-dark-border text-xs text-gray-400 dark:text-gray-500">
          暂无可用模型，请点击右上角手动添加或从云端获取
        </div>
      )}
    </div>
  </div>
);
