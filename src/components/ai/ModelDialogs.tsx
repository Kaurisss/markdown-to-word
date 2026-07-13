import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ModelDialogsProps {
  // Add model
  showAddModel: boolean;
  isAddModelClosing: boolean;
  closeAddModel: () => void;
  handleAddModel: () => void;
  newModelId: string;
  setNewModelId: (v: string) => void;
  newModelName: string;
  setNewModelName: (v: string) => void;

  // Edit model
  showEditModel: boolean;
  isEditModelClosing: boolean;
  closeEditModel: () => void;
  handleSaveEditModel: () => void;
  editModelId: string;
  setEditModelId: (v: string) => void;
  editModelName: string;
  setEditModelName: (v: string) => void;
}

export const ModelDialogs: React.FC<ModelDialogsProps> = (props) => (
  <>
    {/* Add Model Modal */}
    <Dialog open={props.showAddModel || props.isAddModelClosing} onOpenChange={(open) => { if (!open) props.closeAddModel(); }}>
      <DialogContent className="w-[380px] p-5 gap-0" showCloseButton={false}>
        <DialogHeader className="mb-4 text-center shrink-0">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-50">添加自定义模型</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              模型 ID <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={props.newModelId}
              onChange={(e) => props.setNewModelId(e.target.value)}
              placeholder="例如: gpt-4o, claude-3-5-sonnet"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
              autoFocus
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">显示名称</Label>
            <Input
              type="text"
              value={props.newModelName}
              onChange={(e) => props.setNewModelName(e.target.value)}
              placeholder="自定义在应用中显示的名称（可选）"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>
          
          <div className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            模型 ID 是实际传递给 API 请求的标识符，请务必与对应云端平台的模型标识保持完全一致。
          </div>

          <DialogFooter className="mt-5 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={props.closeAddModel} className="rounded-lg h-9 text-xs font-medium cursor-pointer">
              取消
            </Button>
            <Button size="sm" onClick={props.handleAddModel} disabled={!props.newModelId.trim()} className="rounded-lg h-9 text-xs font-medium cursor-pointer">
              确定
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Model Modal */}
    <Dialog open={props.showEditModel || props.isEditModelClosing} onOpenChange={(open) => { if (!open) props.closeEditModel(); }}>
      <DialogContent className="w-[380px] p-5 gap-0" showCloseButton={false}>
        <DialogHeader className="mb-4 text-center shrink-0">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-50">编辑模型</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              模型 ID <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={props.editModelId}
              onChange={(e) => props.setEditModelId(e.target.value)}
              placeholder="例如: gpt-4o, claude-3-5-sonnet"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">显示名称</Label>
            <Input
              type="text"
              value={props.editModelName}
              onChange={(e) => props.setEditModelName(e.target.value)}
              placeholder="自定义在应用中显示的名称（可选）"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>
          
          <div className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            模型 ID 是实际传递给 API 请求的标识符，请务必与对应云端平台的模型标识保持完全一致。
          </div>

          <DialogFooter className="mt-5 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={props.closeEditModel} className="rounded-lg h-9 text-xs font-medium cursor-pointer">
              取消
            </Button>
            <Button size="sm" onClick={props.handleSaveEditModel} disabled={!props.editModelId.trim()} className="rounded-lg h-9 text-xs font-medium cursor-pointer">
              保存
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </>
);
