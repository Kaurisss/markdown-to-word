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
    <div className="flex items-center gap-3">
      <div className="ui-section-title">
        模型管理
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={onAddModel}
        className="flex items-center gap-2 px-4 h-9 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-md transition-colors w-fit"
      >
        <AddLine className="w-4 h-4" />
        添加模型
      </button>
      <button
        onClick={onFetchRemoteModels}
        className="flex items-center gap-2 px-4 h-9 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-md transition-colors w-fit"
      >
        <DownloadLine className="w-4 h-4" />
        获取模型列表
      </button>
    </div>

    <div className="space-y-2">
      {provider.models.map(model => (
        <ContextMenu key={model.id}>
          <ContextMenuTrigger asChild>
            <div
              data-model-card
              className="flex items-center justify-between p-3 rounded-md border group transition-all bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-element-hover"
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
            <ContextMenuItem onClick={() => onTestModel(model)}>
              <PlayLine className="w-4 h-4 mr-2" /> 测试连接
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onEditModel(model)}>
              <Edit2Line className="w-4 h-4 mr-2" /> 编辑
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onCopyModel(model)}>
              <Copy2Line className="w-4 h-4 mr-2" /> 复制配置
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onDeleteModel(model)} className="text-red-500 hover:text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:focus:text-red-300">
              <Delete2Line className="w-4 h-4 mr-2" /> 删除
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
      {provider.models.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-400">
          暂无模型，请添加
        </div>
      )}
    </div>
  </div>
);
