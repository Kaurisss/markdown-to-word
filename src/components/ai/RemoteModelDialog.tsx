import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Refresh2Line, AddLine, SearchLine, MinimizeLine } from '@mingcute/react';

interface RemoteModel {
  id: string;
}

interface RemoteModelDialogProps {
  show: boolean;
  isClosing: boolean;
  onClose: () => void;
  providerName: string;

  loading: boolean;
  error: string | null;
  remoteModels: RemoteModel[];
  existingModelIds: string[];

  search: string;
  onSearchChange: (val: string) => void;

  onRefresh: () => void;
  onAddOne: (id: string) => void;
  onRemoveOne: (id: string) => void;
  onAddAll: (models: RemoteModel[]) => void;
}

export const RemoteModelDialog: React.FC<RemoteModelDialogProps> = ({
  show,
  isClosing,
  onClose,
  providerName,
  loading,
  error,
  remoteModels,
  existingModelIds,
  search,
  onSearchChange,
  onRefresh,
  onAddOne,
  onRemoveOne,
  onAddAll,
}) => {
  const existingSet = useMemo(() => new Set(existingModelIds), [existingModelIds]);

  const filteredModels = useMemo(() => {
    if (!search.trim()) return remoteModels;
    return remoteModels.filter(m => m.id.toLowerCase().includes(search.toLowerCase()));
  }, [remoteModels, search]);

  const modelsToAdd = useMemo(() => {
    return filteredModels.filter(m => !existingSet.has(m.id));
  }, [filteredModels, existingSet]);

  return (
    <Dialog open={show || isClosing} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[520px] p-5 gap-0 max-h-[80vh] flex flex-col border border-gray-200/60 dark:border-dark-border shadow-xl" showCloseButton={true}>
        <DialogHeader className="mb-4 shrink-0 text-center">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-50">{providerName} 模型列表</DialogTitle>
        </DialogHeader>

        {/* 顶部搜索与操作栏 */}
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <div className="relative flex-1">
            <SearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索可用模型 ID..."
              className="pl-9.5 h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9.5 px-3 gap-1 rounded-lg text-xs font-medium cursor-pointer"
            onClick={onRefresh}
            disabled={loading}
          >
            <Refresh2Line className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            重新获取
          </Button>
          <Button 
            size="sm" 
            className="h-9.5 px-3 gap-1 rounded-lg text-xs font-medium cursor-pointer" 
            onClick={() => onAddAll(modelsToAdd)}
            disabled={loading || modelsToAdd.length === 0}
          >
            <AddLine className="w-3.5 h-3.5" />
            全部添加 ({modelsToAdd.length})
          </Button>
        </div>

        {/* 模型列表列表卡片 */}
        <div className="flex-1 overflow-y-auto min-h-[320px] border border-gray-200/80 dark:border-dark-border rounded-md divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-surface">
          {loading ? (
            <div className="flex flex-col w-full">
              {['60%', '45%', '70%', '50%', '80%', '40%', '65%', '55%'].map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 px-4">
                  <div className="h-4 bg-gray-100 dark:bg-dark-element rounded animate-pulse" style={{ width: w }} />
                  <div className="w-7 h-7 bg-gray-100 dark:bg-dark-element rounded-md animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-xs text-red-500 min-h-[320px] px-6 text-center leading-relaxed">
              获取模型列表失败: {error}
            </div>
          ) : remoteModels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-gray-400 dark:text-gray-500 min-h-[320px]">
              该平台云端未返回任何模型标识
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-gray-400 dark:text-gray-500 min-h-[320px]">
              无匹配该搜索关键字的模型
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-dark-border">
              {filteredModels.map(m => {
                const isAdded = existingSet.has(m.id);
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 px-4 hover:bg-gray-50/50 dark:hover:bg-dark-element/20 transition-all">
                    <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate pr-4 font-mono" title={m.id}>
                      {m.id}
                    </span>
                    {isAdded ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                        onClick={() => onRemoveOne(m.id)}
                        title="自当前列表中移除模型"
                        aria-label="移除模型"
                      >
                        <MinimizeLine className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 shrink-0 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg cursor-pointer transition-colors"
                        onClick={() => onAddOne(m.id)}
                        title="添加此模型到列表中"
                        aria-label="添加模型"
                      >
                        <AddLine className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
