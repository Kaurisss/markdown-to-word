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

interface SettingCardProps {
  children: React.ReactNode;
  className?: string;
}

const SettingCard: React.FC<SettingCardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden ${className}`}>
    {children}
  </div>
);

interface SettingItemProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  children,
  className = '',
}) => (
  <div className={`flex items-center justify-between p-3.5 gap-6 hover:bg-gray-50/50 dark:hover:bg-dark-element/20 transition-colors ${className}`}>
    <div className="flex-1 min-w-0">
      <h4 className="text-[13px] font-medium text-gray-800 dark:text-gray-100">
        {title}
      </h4>
      {description && (
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
          {description}
        </div>
      )}
    </div>
    <div className="shrink-0 flex items-center">
      {children}
    </div>
  </div>
);

const SidebarItem: React.FC<{ section: typeof sectionOptions[number], active: boolean, onClick: () => void }> = ({ section, active, onClick }) => {
  const Icon = section.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-2.5 ${
        active
          ? 'bg-gray-200/60 dark:bg-dark-element text-gray-900 dark:text-gray-100 font-medium'
          : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element/40'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`} />
      <div className="min-w-0">
        <div className="text-[13px] leading-tight font-medium">
          {section.label}
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">{section.desc}</div>
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
      <DialogContent className="h-[520px] w-[780px] overflow-hidden p-0 sm:max-w-[780px] flex flex-row gap-0 border border-gray-200/60 dark:border-dark-border shadow-2xl rounded-lg bg-transparent">
        <DialogTitle className="sr-only">高级页面设置</DialogTitle>
        <aside className="w-48 shrink-0 bg-[#fafafa] dark:bg-[#1a1a1a]/90 border-r border-gray-200/50 dark:border-dark-border flex flex-col relative z-40 rounded-l-lg">
          <div className="h-14 px-5 flex items-center shrink-0 relative mt-2">
            <div className="ui-sidebar-kicker text-[14px] font-semibold text-gray-800 dark:text-gray-100 pointer-events-none flex items-center gap-2">
              <Settings3Line className="w-[18px] h-[18px]" />
              高级设置
            </div>
          </div>
          <nav className="px-2 py-1 space-y-1 flex-1 overflow-y-auto">
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

        <main className="flex-1 min-w-0 flex flex-col bg-white dark:bg-dark-surface h-full rounded-r-lg">
          <div className="px-8 pb-3 pt-6 shrink-0 border-b border-gray-100/50 dark:border-dark-border/40">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{activeSectionLabel}</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-8 pt-5">
            {activeSection === 'size' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    纸张尺寸
                  </div>
                  <SettingCard>
                    <SettingItem title="宽度（英寸）">
                      <SpinnerInput
                        id="input-width"
                        value={toInches(pageSize, 'width')}
                        step={0.1}
                        min={1}
                        suffix="in"
                        className="w-32 h-8"
                        onChange={(width) => updatePageSize({ width })}
                      />
                    </SettingItem>
                    <SettingItem title="高度（英寸）">
                      <SpinnerInput
                        id="input-height"
                        value={toInches(pageSize, 'height')}
                        step={0.1}
                        min={1}
                        suffix="in"
                        className="w-32 h-8"
                        onChange={(height) => updatePageSize({ height })}
                      />
                    </SettingItem>
                  </SettingCard>
                </div>
              </div>
            )}

            {activeSection === 'header' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    基本设置
                  </div>
                  <SettingCard>
                    <SettingItem title="启用页眉">
                      <Switch aria-label="启用页眉" checked={header.enabled} onCheckedChange={(enabled) => updateHeader({ enabled })} />
                    </SettingItem>
                  </SettingCard>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    页眉内容与边距
                  </div>
                  <SettingCard>
                    <SettingItem title="页眉文本" description="配置在页眉显示的默认文字，留空则不显示">
                      <Input
                        id="input-header-text"
                        value={header.text || ''}
                        onChange={(event) => updateHeader({ text: event.target.value })}
                        placeholder="请输入页眉文本"
                        disabled={!header.enabled}
                        className="w-48 h-8 text-[13px]"
                      />
                    </SettingItem>
                    <SettingItem title="距边界（英寸）">
                      <SpinnerInput
                        id="input-header-distance"
                        value={header.distance}
                        step={0.1}
                        min={0}
                        suffix="in"
                        className="w-32 h-8"
                        onChange={(distance) => updateHeader({ distance })}
                      />
                    </SettingItem>
                  </SettingCard>
                </div>
              </div>
            )}

            {activeSection === 'footer' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    基本设置
                  </div>
                  <SettingCard>
                    <SettingItem title="启用页脚">
                      <Switch aria-label="启用页脚" checked={footer.enabled} onCheckedChange={(enabled) => updateFooter({ enabled })} />
                    </SettingItem>
                    <SettingItem title="显示页码">
                      <Switch aria-label="显示页码" checked={footer.pageNumber} onCheckedChange={(pageNumber) => updateFooter({ pageNumber })} />
                    </SettingItem>
                    <SettingItem title="正文后重新编号" description="目录页不显示页码，正文从配置的起始页开始。">
                      <Switch aria-label="正文后重新编号" checked={Boolean(footer.startAtBody)} onCheckedChange={(startAtBody) => updateFooter({ startAtBody })} />
                    </SettingItem>
                  </SettingCard>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    内容与格式
                  </div>
                  <SettingCard>
                    <SettingItem title="页码格式" description="可用占位符：{page} 当前页，{pages} 总页数。">
                      <Input
                        id="input-footer-format"
                        value={footer.format || ''}
                        onChange={(event) => updateFooter({ format: event.target.value })}
                        placeholder="第{page}页"
                        disabled={!footer.enabled || !footer.pageNumber}
                        className="w-48 h-8 text-[13px]"
                      />
                    </SettingItem>
                    <SettingItem title="距边界（英寸）">
                      <SpinnerInput
                        id="input-footer-distance"
                        value={footer.distance}
                        step={0.1}
                        min={0}
                        suffix="in"
                        className="w-32 h-8"
                        onChange={(distance) => updateFooter({ distance })}
                      />
                    </SettingItem>
                  </SettingCard>
                </div>
              </div>
            )}

            {activeSection === 'toc' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    大纲生成与选项
                  </div>
                  <SettingCard>
                    <SettingItem title="生成目录">
                      <Switch aria-label="生成目录" checked={cfg.global.includeTableOfContents} onCheckedChange={(includeTableOfContents) => updateGlobal({ includeTableOfContents })} />
                    </SettingItem>
                    <SettingItem title="第一个一级标题作为题名">
                      <Switch aria-label="第一个一级标题作为题名" checked={Boolean(bodyStart.firstHeadingAsTitle)} onCheckedChange={(firstHeadingAsTitle) => updateGlobal({ bodyStart: { ...bodyStart, firstHeadingAsTitle } })} />
                    </SettingItem>
                    <SettingItem title="目录后正文重新编号">
                      <Switch aria-label="目录后正文重新编号" checked={Boolean(bodyStart.restartPageNumberAfterToc)} onCheckedChange={(restartPageNumberAfterToc) => updateGlobal({ bodyStart: { ...bodyStart, restartPageNumberAfterToc } })} />
                    </SettingItem>
                  </SettingCard>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    层级与起始页
                  </div>
                  <SettingCard>
                    <SettingItem title="目录最大层级">
                      <Select
                        className="w-48"
                        triggerClassName="h-8 text-[13px] rounded-md"
                        optionClassName="text-[13px]"
                        value={tableOfContents.maxLevel ?? 2}
                        onChange={(value) => updateGlobal({ tableOfContents: { ...tableOfContents, maxLevel: Number(value) } })}
                        options={[1, 2, 3, 4, 5, 6].map((level) => ({ label: `${level} 级标题`, value: level }))}
                      />
                    </SettingItem>
                    <SettingItem title="正文起始页码">
                      <SpinnerInput
                        id="input-body-start"
                        value={bodyStart.pageNumberStart ?? 1}
                        step={1}
                        min={1}
                        className="w-32 h-8"
                        onChange={(pageNumberStart) => updateGlobal({ bodyStart: { ...bodyStart, pageNumberStart } })}
                      />
                    </SettingItem>
                  </SettingCard>
                </div>
              </div>
            )}

            {activeSection === 'other' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    表格与内容处理
                  </div>
                  <SettingCard>
                    <SettingItem title="表头加粗" description="导出的 Word 中表格的表头将自动应用加粗样式。">
                      <Switch aria-label="表头加粗" checked={Boolean(cfg.global.tableHeaderBold)} onCheckedChange={(tableHeaderBold) => updateGlobal({ tableHeaderBold })} />
                    </SettingItem>
                  </SettingCard>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    文本规范化
                  </div>
                  <SettingCard>
                    <SettingItem title="中文标点规范化" description="导出时将中文上下文里的半角标点自动转换为全角，代码块和链接中的内容将被跳过保护。">
                      <Switch aria-label="中文标点规范化" checked={Boolean(cfg.global.normalizePunctuation)} onCheckedChange={(normalizePunctuation) => updateGlobal({ normalizePunctuation })} />
                    </SettingItem>
                  </SettingCard>
                </div>
              </div>
            )}
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
};
