import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import { AddLine } from '@mingcute/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ProviderIcon } from './ProviderIcon';
import { ProviderIconPicker } from './ProviderIconPicker';
import { AI_API_ENDPOINT_EXAMPLES } from './apiGuide';
import { ProviderFormValues } from '../../features/ai/validation';


interface PlatformDialogsProps {
  // Add platform
  showAddPlatform: boolean;
  isAddPlatformClosing: boolean;
  closeAddPlatform: () => void;
  handleAddPlatform: () => void;
  newPlatformName: string;
  setNewPlatformName: (v: string) => void;
  newPlatformUrl: string;
  setNewPlatformUrl: (v: string) => void;
  newPlatformDescription: string;
  setNewPlatformDescription: (v: string) => void;
  newPlatformIconKey: string;
  setNewPlatformIconKey: (v: string) => void;
  addPlatformErrors: FieldErrors<ProviderFormValues>;

  // Edit platform
  showEditPlatform: boolean;
  isEditPlatformClosing: boolean;
  closeEditPlatform: () => void;
  handleSaveEditPlatform: () => void;
  editPlatformName: string;
  setEditPlatformName: (v: string) => void;
  editPlatformUrl: string;
  setEditPlatformUrl: (v: string) => void;
  editPlatformDescription: string;
  setEditPlatformDescription: (v: string) => void;
  editPlatformIconKey: string;
  setEditPlatformIconKey: (v: string) => void;
  editPlatformErrors: FieldErrors<ProviderFormValues>;
}

export const PlatformDialogs: React.FC<PlatformDialogsProps> = (props) => (
  <>
    {/* Add Platform Modal */}
    <Dialog open={props.showAddPlatform || props.isAddPlatformClosing} onOpenChange={(open) => { if (!open) props.closeAddPlatform(); }}>
      <DialogContent className="w-[420px] p-5 gap-0" showCloseButton={false}>

        <DialogHeader className="mb-3">
          <DialogTitle className="text-sm font-semibold text-center">添加自定义平台</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-md border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-element hover:bg-gray-100 dark:hover:bg-dark-element-hover transition-colors"
                >
                  {props.newPlatformIconKey ? (
                    <ProviderIcon iconKey={props.newPlatformIconKey} name={props.newPlatformName} size={28} />
                  ) : (
                    <AddLine className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="center" side="bottom" className="w-80 p-3 z-[100000]">
                <ProviderIconPicker
                  value={props.newPlatformIconKey}
                  onChange={props.setNewPlatformIconKey}
                  compact
                />
              </PopoverContent>
            </Popover>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">选择图标</span>
          </div>
          <div className="space-y-1.5">
            <Label className="ui-field-label">平台名称</Label>
            <Input
              type="text"
              value={props.newPlatformName}
              onChange={(e) => props.setNewPlatformName(e.target.value)}
              placeholder="例如：我的 AI 平台"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="ui-field-label">Base URL <span className="text-gray-400 font-normal">(可选)</span></Label>
            <Input
              type="text"
              value={props.newPlatformUrl}
              onChange={(e) => props.setNewPlatformUrl(e.target.value)}
              placeholder="https://api.example.com/v1/chat/completions"
            />
          </div>
          {props.addPlatformErrors.baseUrl && (
            <p className="text-xs text-red-500">{props.addPlatformErrors.baseUrl.message}</p>
          )}
          <div className="space-y-1.5">
            <Label className="ui-field-label">平台描述 <span className="text-gray-400 font-normal">(可选)</span></Label>
            <Input
              type="text"
              value={props.newPlatformDescription}
              onChange={(e) => props.setNewPlatformDescription(e.target.value)}
              placeholder="简要描述该平台"
            />
          </div>
          <div className="rounded-md bg-gray-50 p-2.5 text-xs leading-5 text-gray-500 dark:bg-dark-element dark:text-gray-400">
            自定义平台需要提供 OpenAI 兼容的 Chat Completions 完整端点。留空时使用默认示例地址，之后仍可编辑。
          </div>
          <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={props.closeAddPlatform}>
              取消
            </Button>
            <Button size="sm" onClick={props.handleAddPlatform} disabled={!props.newPlatformName.trim()}>
              确定
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Platform Modal */}
    <Dialog open={props.showEditPlatform || props.isEditPlatformClosing} onOpenChange={(open) => { if (!open) props.closeEditPlatform(); }}>
      <DialogContent className="w-[420px] p-5 gap-0" showCloseButton={false}>

        <DialogHeader className="mb-3">
          <DialogTitle className="text-sm font-semibold text-center">编辑平台</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-md border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-element hover:bg-gray-100 dark:hover:bg-dark-element-hover transition-colors"
                >
                  {props.editPlatformIconKey ? (
                    <ProviderIcon iconKey={props.editPlatformIconKey} name={props.editPlatformName} size={28} />
                  ) : (
                    <AddLine className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="center" side="bottom" className="w-80 p-3 z-[100000]">
                <ProviderIconPicker
                  value={props.editPlatformIconKey}
                  onChange={props.setEditPlatformIconKey}
                  compact
                />
              </PopoverContent>
            </Popover>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">选择图标</span>
          </div>
          <div className="space-y-1.5">
            <Label className="ui-field-label">平台名称</Label>
            <Input
              type="text"
              value={props.editPlatformName}
              onChange={(e) => props.setEditPlatformName(e.target.value)}
              placeholder="例如：我的 AI 平台"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="ui-field-label">Base URL <span className="text-gray-400 font-normal">(可选)</span></Label>
            <Input
              type="text"
              value={props.editPlatformUrl}
              onChange={(e) => props.setEditPlatformUrl(e.target.value)}
              placeholder="https://api.example.com/v1/chat/completions"
            />
          </div>
          {props.editPlatformErrors.baseUrl && (
            <p className="text-xs text-red-500">{props.editPlatformErrors.baseUrl.message}</p>
          )}
          <div className="space-y-1.5">
            <Label className="ui-field-label">平台描述 <span className="text-gray-400 font-normal">(可选)</span></Label>
            <Input
              type="text"
              value={props.editPlatformDescription}
              onChange={(e) => props.setEditPlatformDescription(e.target.value)}
              placeholder="简要描述该平台"
            />
          </div>
          <div className="rounded-md bg-gray-50 p-2.5 text-xs leading-5 text-gray-500 dark:bg-dark-element dark:text-gray-400">
            自定义平台需要提供 OpenAI 兼容的 Chat Completions 完整端点。留空时使用默认示例地址，之后仍可编辑。
          </div>
          <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={props.closeEditPlatform}>
              取消
            </Button>
            <Button size="sm" onClick={props.handleSaveEditPlatform} disabled={!props.editPlatformName.trim()}>
              保存
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </>
);
