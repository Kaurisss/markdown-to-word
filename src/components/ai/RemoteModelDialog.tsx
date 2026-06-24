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
      <DialogContent className="w-[500px] p-4 gap-0 max-h-[80vh] flex flex-col" showCloseButton={true}>
        <DialogHeader className="mb-4 shrink-0">
          <DialogTitle className="text-base font-semibold">{providerName} 模型列表</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4 shrink-0">
          <div className="relative flex-1">
            <SearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索模型 ID..."
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 px-3 gap-1" onClick={onRefresh} disabled={loading}>
            <Refresh2Line className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            重新获取
          </Button>
          <Button 
            size="sm" 
            className="h-9 px-3 gap-1" 
            onClick={() => onAddAll(modelsToAdd)}
            disabled={loading || modelsToAdd.length === 0}
          >
            <AddLine className="w-4 h-4" />
            添加全部 ({modelsToAdd.length})
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] border border-gray-200 dark:border-dark-border rounded-md divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400 min-h-[300px]">加载中...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-sm text-red-500 min-h-[300px] px-4 text-center">{error}</div>
          ) : remoteModels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400 min-h-[300px]">远程无模型</div>
          ) : filteredModels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400 min-h-[300px]">搜索无结果</div>
          ) : (
            <div className="flex flex-col">
              {filteredModels.map(m => {
                const isAdded = existingSet.has(m.id);
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-element-hover">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate pr-4" title={m.id}>{m.id}</span>
                    {isAdded ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => onRemoveOne(m.id)}
                        title="移除模型"
                        aria-label="移除模型"
                      >
                        <MinimizeLine className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 shrink-0 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                        onClick={() => onAddOne(m.id)}
                        title="添加模型"
                        aria-label="添加模型"
                      >
                        <AddLine className="w-4 h-4" />
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
