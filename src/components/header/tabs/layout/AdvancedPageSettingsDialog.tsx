import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../ui/dialog';
import { Input } from '../../../ui/input';
import { Select } from '../../../ui/Select';
import { Switch } from '../../../ui/switch';
import { SpinnerInput } from '../../../ui/SpinnerInput';
import { DEFAULT_CONFIG } from '../../../../config/defaultConfig';
import { DocumentConfig, FooterConfig, HeaderConfig, PageSize } from '../../../../types/config';
import { Settings3Line, FileLine, BookLine, LetterSpacingLine, ListCheckLine, ComponentsLine } from '@mingcute/react';

interface AdvancedPageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
}

const sectionOptions = [
  { id: 'size', label: '页面尺寸', desc: '大小与宽高度', icon: FileLine },
  { id: 'header', label: '页眉设置', desc: '顶部区域', icon: BookLine },
  { id: 'footer', label: '页脚与页码', desc: '底部区域', icon: LetterSpacingLine },
  { id: 'toc', label: '目录与正文', desc: '大纲与编号', icon: ListCheckLine },
  { id: 'other', label: '表格与规范', desc: '内容处理', icon: ComponentsLine },
] as const;

const helpTextClass = 'text-[12px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1';
const labelClass = 'ui-field-label block text-sm mb-2';

const DEFAULT_HEADER = DEFAULT_CONFIG.global.header!;
const DEFAULT_FOOTER = DEFAULT_CONFIG.global.footer!;
const DEFAULT_PAGE_SIZE = DEFAULT_CONFIG.global.pageSize!;
const DEFAULT_TOC = DEFAULT_CONFIG.global.tableOfContents!;
const DEFAULT_BODY_START = DEFAULT_CONFIG.global.bodyStart!;

function toInches(pageSize: PageSize, key: 'width' | 'height') {
  const value = Number(pageSize[key]) || 0;
  return pageSize.unit === 'cm'
    ? Number((value / 2.54).toFixed(2))
    : Number(value.toFixed(2));
}

function switchRow(label: string, checked: boolean, onCheckedChange: (checked: boolean) => void, description?: string) {
  return (
    <div className="flex items-center justify-between gap-6 py-1.5">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] text-gray-900 dark:text-gray-100">{label}</div>
        {description && <div className={helpTextClass}>{description}</div>}
      </div>
      <Switch aria-label={label} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function fieldRow(label: string, control: React.ReactNode, description?: string) {
  return (
    <div className="flex items-center justify-between gap-6 py-1.5">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] text-gray-900 dark:text-gray-100">{label}</div>
        {description && <div className={helpTextClass}>{description}</div>}
      </div>
      <div className="shrink-0 flex items-center justify-end">
        {control}
      </div>
    </div>
  );
}

const SidebarItem: React.FC<{ section: typeof sectionOptions[number], active: boolean, onClick: () => void }> = ({ section, active, onClick }) => {
  const Icon = section.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md border transition-colors flex items-center gap-2 ${
        active
          ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
          : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-dark-element'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`} />
      <div className="min-w-0">
        <div className={`text-sm ${active ? 'text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
          {section.label}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{section.desc}</div>
      </div>
    </button>
  );
};

export const AdvancedPageSettingsDialog: React.FC<AdvancedPageSettingsDialogProps> = ({
  open,
  onOpenChange,
  cfg,
  onCfgChange,
}) => {
  const [activeSection, setActiveSection] = useState<typeof sectionOptions[number]['id']>('size');

  const header = cfg.global.header ?? DEFAULT_HEADER;
  const footer = cfg.global.footer ?? DEFAULT_FOOTER;
  const pageSize = cfg.global.pageSize ?? DEFAULT_PAGE_SIZE;
  const tableOfContents = cfg.global.tableOfContents ?? DEFAULT_TOC;
  const bodyStart = cfg.global.bodyStart ?? DEFAULT_BODY_START;

  const updateGlobal = (patch: Partial<DocumentConfig['global']>) => {
    onCfgChange({ ...cfg, global: { ...cfg.global, ...patch } });
  };

  const updateHeader = (patch: Partial<HeaderConfig>) => {
    updateGlobal({ header: { ...header, ...patch } });
  };

  const updateFooter = (patch: Partial<FooterConfig>) => {
    updateGlobal({ footer: { ...footer, ...patch } });
  };

  const updatePageSize = (patch: Partial<Pick<PageSize, 'width' | 'height'>>) => {
    updateGlobal({
      pageSize: {
        width: patch.width ?? toInches(pageSize, 'width'),
        height: patch.height ?? toInches(pageSize, 'height'),
        unit: 'in',
      },
    });
  };

  const activeSectionLabel = sectionOptions.find(s => s.id === activeSection)?.label ?? '设置';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[520px] w-[780px] overflow-hidden p-0 sm:max-w-[780px] flex flex-row gap-0 border-0 shadow-2xl rounded-xl bg-transparent">
        <DialogTitle className="sr-only">高级页面设置</DialogTitle>
        <aside className="w-48 shrink-0 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col relative z-40 rounded-l-xl">
          <div className="h-12 px-5 flex items-center shrink-0 relative mt-2">
            <div className="ui-sidebar-kicker text-[14px] font-semibold text-gray-700 dark:text-gray-200 pointer-events-none flex items-center gap-2">
              <Settings3Line className="w-[18px] h-[18px]" />
              高级设置
            </div>
          </div>
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
            {sectionOptions.map(section => (
              <SidebarItem
                key={section.id}
                section={section}
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col bg-white dark:bg-dark-surface h-full rounded-r-xl">
          <div className="px-8 pb-4 pt-8 shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{activeSectionLabel}</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
            {activeSection === 'size' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-2">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2 mb-3">自定义纸张尺寸</div>
                  {fieldRow('宽度（英寸）', (
                    <SpinnerInput
                      id="input-width"
                      value={toInches(pageSize, 'width')}
                      step={0.1}
                      min={1}
                      suffix="in"
                      className="w-32 h-8"
                      onChange={(width) => updatePageSize({ width })}
                    />
                  ))}
                  {fieldRow('高度（英寸）', (
                    <SpinnerInput
                      id="input-height"
                      value={toInches(pageSize, 'height')}
                      step={0.1}
                      min={1}
                      suffix="in"
                      className="w-32 h-8"
                      onChange={(height) => updatePageSize({ height })}
                    />
                  ))}
                </section>
              </div>
            )}

            {activeSection === 'header' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2">基本设置</div>
                  <div className="space-y-2">
                    {switchRow('启用页眉', header.enabled, (enabled) => updateHeader({ enabled }))}
                  </div>
                </section>

                <section className="space-y-2">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2 mb-3">页眉内容</div>
                  {fieldRow('页眉文本', (
                    <Input
                      id="input-header-text"
                      value={header.text}
                      onChange={(event) => updateHeader({ text: event.target.value })}
                      placeholder="留空则不显示"
                      disabled={!header.enabled}
                      className="w-48 h-8 text-[13px]"
                    />
                  ))}
                  {fieldRow('距边界（英寸）', (
                    <SpinnerInput
                      id="input-header-distance"
                      value={header.distance}
                      step={0.1}
                      min={0}
                      suffix="in"
                      className="w-32 h-8"
                      onChange={(distance) => updateHeader({ distance })}
                    />
                  ))}
                </section>
              </div>
            )}

            {activeSection === 'footer' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2">基本设置</div>
                  <div className="space-y-2">
                    {switchRow('启用页脚', footer.enabled, (enabled) => updateFooter({ enabled }))}
                    {switchRow('显示页码', footer.pageNumber, (pageNumber) => updateFooter({ pageNumber }))}
                    {switchRow('正文后重新编号', Boolean(footer.startAtBody), (startAtBody) => updateFooter({ startAtBody }), '目录页不显示页码，正文从配置的起始页开始。')}
                  </div>
                </section>

                <section className="space-y-2">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2 mb-3">内容与格式</div>
                  {fieldRow('页码格式', (
                    <Input
                      id="input-footer-format"
                      value={footer.format}
                      onChange={(event) => updateFooter({ format: event.target.value })}
                      placeholder="第{page}页"
                      disabled={!footer.enabled || !footer.pageNumber}
                      className="w-48 h-8 text-[13px]"
                    />
                  ), '可用占位符：{page} 当前页，{pages} 总页数。')}
                  {fieldRow('距边界（英寸）', (
                    <SpinnerInput
                      id="input-footer-distance"
                      value={footer.distance}
                      step={0.1}
                      min={0}
                      suffix="in"
                      className="w-32 h-8"
                      onChange={(distance) => updateFooter({ distance })}
                    />
                  ))}
                </section>
              </div>
            )}

            {activeSection === 'toc' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2">大纲生成</div>
                  <div className="space-y-2">
                    {switchRow('生成目录', cfg.global.includeTableOfContents, (includeTableOfContents) => updateGlobal({ includeTableOfContents }))}
                    {switchRow('第一个一级标题作为题名', Boolean(bodyStart.firstHeadingAsTitle), (firstHeadingAsTitle) => updateGlobal({ bodyStart: { ...bodyStart, firstHeadingAsTitle } }))}
                    {switchRow('目录后正文重新编号', Boolean(bodyStart.restartPageNumberAfterToc), (restartPageNumberAfterToc) => updateGlobal({ bodyStart: { ...bodyStart, restartPageNumberAfterToc } }))}
                  </div>
                </section>

                <section className="space-y-2">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2 mb-3">层级与页码</div>
                  {fieldRow('目录最大层级', (
                    <Select
                      className="w-48"
                      triggerClassName="h-8 text-[13px] rounded-md"
                      optionClassName="text-[13px]"
                      value={tableOfContents.maxLevel ?? 2}
                      onChange={(value) => updateGlobal({ tableOfContents: { ...tableOfContents, maxLevel: Number(value) } })}
                      options={[1, 2, 3, 4, 5, 6].map((level) => ({ label: `${level} 级标题`, value: level }))}
                    />
                  ))}
                  {fieldRow('正文起始页码', (
                    <SpinnerInput
                      id="input-body-start"
                      value={bodyStart.pageNumberStart ?? 1}
                      step={1}
                      min={1}
                      className="w-32 h-8"
                      onChange={(pageNumberStart) => updateGlobal({ bodyStart: { ...bodyStart, pageNumberStart } })}
                    />
                  ))}
                </section>
              </div>
            )}

            {activeSection === 'other' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2">表格处理</div>
                  <div className="space-y-2">
                    {switchRow('表头加粗', Boolean(cfg.global.tableHeaderBold), (tableHeaderBold) => updateGlobal({ tableHeaderBold }), '导出的 Word 中表格的表头将自动应用加粗样式。')}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="text-[15px] font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-2">文本规范化</div>
                  <div className="space-y-2">
                    {switchRow('中文标点规范化', Boolean(cfg.global.normalizePunctuation), (normalizePunctuation) => updateGlobal({ normalizePunctuation }), '导出时将中文上下文里的半角标点自动转换为全角，代码块和链接中的内容将被跳过保护。')}
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
};
