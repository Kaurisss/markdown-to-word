import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AI_MODEL_ID_EXAMPLES } from './apiGuide';


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
      <DialogContent className="w-80 p-4 gap-0" showCloseButton={false}>

        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-semibold">添加模型</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="ui-field-label">模型 ID <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={props.newModelId}
              onChange={(e) => props.setNewModelId(e.target.value)}
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
              value={props.newModelName}
              onChange={(e) => props.setNewModelName(e.target.value)}
              placeholder="留空则使用模型 ID"
            />
          </div>
          <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={props.closeAddModel}>
              取消
            </Button>
            <Button size="sm" onClick={props.handleAddModel} disabled={!props.newModelId.trim()}>
              确定
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Model Modal */}
    <Dialog open={props.showEditModel || props.isEditModelClosing} onOpenChange={(open) => { if (!open) props.closeEditModel(); }}>
      <DialogContent className="w-80 p-4 gap-0" showCloseButton={false}>

        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-semibold">编辑模型</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="ui-field-label">模型 ID <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={props.editModelId}
              onChange={(e) => props.setEditModelId(e.target.value)}
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
              value={props.editModelName}
              onChange={(e) => props.setEditModelName(e.target.value)}
              placeholder="留空则使用模型 ID"
            />
          </div>
          <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={props.closeEditModel}>
              取消
            </Button>
            <Button size="sm" onClick={props.handleSaveEditModel} disabled={!props.editModelId.trim()}>
              保存
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </>
);
