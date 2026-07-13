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
      <DialogContent className="w-[400px] p-5 gap-0" showCloseButton={false}>
        <DialogHeader className="mb-4 text-center shrink-0">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-50">添加自定义平台</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 选择图标 */}
          <div className="flex flex-col items-center gap-1.5 py-1">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-element hover:bg-gray-100 dark:hover:bg-dark-element-hover transition-all cursor-pointer"
                  title="选择平台图标"
                >
                  {props.newPlatformIconKey ? (
                    <ProviderIcon iconKey={props.newPlatformIconKey} name={props.newPlatformName} size={24} />
                  ) : (
                    <AddLine className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="center" side="bottom" className="w-80 p-3 z-[100000] rounded-xl shadow-lg border border-gray-100 dark:border-dark-border">
                <ProviderIconPicker
                  value={props.newPlatformIconKey}
                  onChange={props.setNewPlatformIconKey}
                  compact
                />
              </PopoverContent>
            </Popover>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">定制图标</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">平台名称</Label>
            <Input
              type="text"
              value={props.newPlatformName}
              onChange={(e) => props.setNewPlatformName(e.target.value)}
              placeholder="例如：自建 DeepSeek-Coder"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Base URL <span className="text-gray-400 font-normal">(可选)</span>
            </Label>
            <Input
              type="text"
              value={props.newPlatformUrl}
              onChange={(e) => props.setNewPlatformUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>
          {props.addPlatformErrors.baseUrl && (
            <p className="text-xs text-red-500 font-medium mt-1">{props.addPlatformErrors.baseUrl.message}</p>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              平台描述 <span className="text-gray-400 font-normal">(可选)</span>
            </Label>
            <Input
              type="text"
              value={props.newPlatformDescription}
              onChange={(e) => props.setNewPlatformDescription(e.target.value)}
              placeholder="简要描述此平台用途"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-element/10 p-3 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            自定义平台需提供 OpenAI 兼容的 API 终点（不带 /chat/completions 后缀）。留空时会采用本地默认终点，随后可进行修改。
          </div>

          <DialogFooter className="mt-5 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={props.closeAddPlatform} className="rounded-lg h-9 text-xs font-medium cursor-pointer">
              取消
            </Button>
            <Button size="sm" onClick={props.handleAddPlatform} disabled={!props.newPlatformName.trim()} className="rounded-lg h-9 text-xs font-medium cursor-pointer">
              确定
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Platform Modal */}
    <Dialog open={props.showEditPlatform || props.isEditPlatformClosing} onOpenChange={(open) => { if (!open) props.closeEditPlatform(); }}>
      <DialogContent className="w-[400px] p-5 gap-0" showCloseButton={false}>
        <DialogHeader className="mb-4 text-center shrink-0">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-50">编辑平台配置</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 选择图标 */}
          <div className="flex flex-col items-center gap-1.5 py-1">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-element hover:bg-gray-100 dark:hover:bg-dark-element-hover transition-all cursor-pointer"
                  title="选择平台图标"
                >
                  {props.editPlatformIconKey ? (
                    <ProviderIcon iconKey={props.editPlatformIconKey} name={props.editPlatformName} size={24} />
                  ) : (
                    <AddLine className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="center" side="bottom" className="w-80 p-3 z-[100000] rounded-xl border border-gray-100 dark:border-dark-border">
                <ProviderIconPicker
                  value={props.editPlatformIconKey}
                  onChange={props.setEditPlatformIconKey}
                  compact
                />
              </PopoverContent>
            </Popover>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">定制图标</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">平台名称</Label>
            <Input
              type="text"
              value={props.editPlatformName}
              onChange={(e) => props.setEditPlatformName(e.target.value)}
              placeholder="例如：自建 DeepSeek-Coder"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Base URL <span className="text-gray-400 font-normal">(可选)</span>
            </Label>
            <Input
              type="text"
              value={props.editPlatformUrl}
              onChange={(e) => props.setEditPlatformUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>
          {props.editPlatformErrors.baseUrl && (
            <p className="text-xs text-red-500 font-medium mt-1">{props.editPlatformErrors.baseUrl.message}</p>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              平台描述 <span className="text-gray-400 font-normal">(可选)</span>
            </Label>
            <Input
              type="text"
              value={props.editPlatformDescription}
              onChange={(e) => props.setEditPlatformDescription(e.target.value)}
              placeholder="简要描述此平台用途"
              className="h-9.5 text-xs rounded-lg focus-visible:ring-brand-500"
            />
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-element/10 p-3 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            自定义平台需提供 OpenAI 兼容的 API 终点（不带 /chat/completions 后缀）。留空时会采用本地默认终点，随后可进行修改。
          </div>

          <DialogFooter className="mt-5 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={props.closeEditPlatform} className="rounded-lg h-9 text-xs font-medium cursor-pointer">
              取消
            </Button>
            <Button size="sm" onClick={props.handleSaveEditPlatform} disabled={!props.editPlatformName.trim()} className="rounded-lg h-9 text-xs font-medium cursor-pointer">
              保存
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </>
);
