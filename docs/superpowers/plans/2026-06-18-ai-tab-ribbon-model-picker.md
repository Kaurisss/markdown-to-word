# AI Tab Ribbon Model Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Intelligent tab into an extensible Word-style ribbon section where model selection happens in the tab, enabled providers expose their models in a grouped picker, and the prompt expands into a popover panel.

**Architecture:** Keep AI configuration as provider/model maintenance, and move runtime model selection into the Intelligent tab. Build two small focused popover components: one for grouped model picking, one for prompt editing/templates; wire them through the existing Zustand `useAIConfigStore` and existing `useAIStyleGenerator` flow.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, Radix/shadcn source components (`Popover`, `Textarea`, `Button`, `Separator`), Vitest + Testing Library.

---

## Success Criteria

- The Intelligent tab uses compact Word-style groups: `模型`, `样式描述`, `生成`, `模板/更多` placeholders.
- The model button opens a popover instead of opening AI configuration directly.
- The model popover shows only `provider.isEnabled === true` providers, grouped by provider, and lists each provider's `models`.
- Selecting a model from the popover updates `selectedModel` via `updateSelectedModel`.
- The AI configuration window no longer marks or toggles a currently selected model; it only manages provider settings and model CRUD.
- The prompt field remains compact in the ribbon and opens a larger popover panel with a textarea and prompt examples.
- Generation still uses the selected model and clears the prompt only after successful generation.
- `pnpm run typecheck`, `pnpm run lint`, and relevant Vitest suites pass.

## File Structure

- Modify `src/components/Header.tsx`
  - Pass `onModelChange={updateSelectedModel}` to `AITab`.
- Modify `src/components/header/tabs/AITab.tsx`
  - Recompose the tab into Word-style groups.
  - Remove bespoke help popover state.
  - Use new model picker and prompt panel components.
- Replace `src/components/header/tabs/ai/AIModelSelector.tsx`
  - Turn it into a grouped `Popover` model picker.
  - Filter disabled providers out of the list.
  - Keep a config shortcut inside the popover for API key/provider setup.
- Replace `src/components/header/tabs/ai/AIPromptInput.tsx`
  - Turn it into a compact trigger plus expandable prompt panel.
  - Use `Popover`, `Textarea`, and template buttons.
- Modify `src/components/header/tabs/ai/AIGenerateButton.tsx`
  - Keep it as a stable ribbon command button.
  - Use token-aware classes and prevent width jumps during loading.
- Modify `src/components/AIConfigWindow.tsx`
  - Remove selected-model visual state and `handleSelectModel` use.
  - Keep test/edit/copy/delete model context menu behavior.
- Modify `src/hooks/useAIConfig.ts`
  - Stop exposing model selection as a config-window concern.
  - Keep selected-model cleanup when deleting models/providers.
- Modify `src/hooks/useAIConfig.test.tsx`
  - Update tests to prove provider/model deletion still clears selected model.
  - Remove any expectation that config-window model cards toggle selection.
- Create `src/components/header/tabs/ai/AIModelSelector.test.tsx`
  - Covers enabled-provider filtering, grouping, and selection callback.
- Create `src/components/header/tabs/ai/AIPromptInput.test.tsx`
  - Covers compact trigger, prompt editing, templates, Enter submit, and successful close behavior.

---

### Task 1: Wire Model Selection Into AITab

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/header/tabs/AITab.tsx`

- [ ] **Step 1: Add `onModelChange` to `AITabProps`**

In `src/components/header/tabs/AITab.tsx`, replace the props interface with:

```ts
interface AITabProps {
  aiProviders: AIProvider[];
  selectedModel: { providerId: string; modelId: string } | null;
  onModelChange: (model: { providerId: string; modelId: string } | null) => void;
  setShowAIConfig: (show: boolean) => void;
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
}
```

Then include `onModelChange` in the component destructuring:

```ts
export const AITab: React.FC<AITabProps> = ({
  aiProviders,
  selectedModel,
  onModelChange,
  setShowAIConfig,
  cfg,
  onCfgChange,
  onShowToast,
  prompt,
  setPrompt
}) => {
```

- [ ] **Step 2: Pass the store updater from `Header`**

In `src/components/Header.tsx`, replace the `AITab` props block:

```tsx
<AITab
  aiProviders={aiProviders}
  selectedModel={selectedModel}
  setShowAIConfig={() => openAIConfigWindow()}
  cfg={cfg}
  onCfgChange={onCfgChange}
  onShowToast={onShowToast}
  prompt={aiPrompt}
  setPrompt={setAiPrompt}
/>
```

With:

```tsx
<AITab
  aiProviders={aiProviders}
  selectedModel={selectedModel}
  onModelChange={updateSelectedModel}
  setShowAIConfig={() => openAIConfigWindow()}
  cfg={cfg}
  onCfgChange={onCfgChange}
  onShowToast={onShowToast}
  prompt={aiPrompt}
  setPrompt={setAiPrompt}
/>
```

- [ ] **Step 3: Keep the current selector call compiling**

In `AITab.tsx`, update the existing `AIModelSelector` usage for now:

```tsx
<AIModelSelector
  aiProviders={aiProviders}
  selectedModel={selectedModel}
  onModelChange={onModelChange}
  onConfigClick={() => setShowAIConfig(true)}
/>
```

Task 2 will replace the selector implementation.

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: FAIL until Task 2 updates `AIModelSelectorProps` to accept `onModelChange`.

- [ ] **Step 5: Commit after Task 2 passes**

Do not commit Task 1 alone because it intentionally creates a temporary type error.

---

### Task 2: Build Grouped Model Picker Popover

**Files:**
- Modify: `src/components/header/tabs/ai/AIModelSelector.tsx`
- Create: `src/components/header/tabs/ai/AIModelSelector.test.tsx`

- [ ] **Step 1: Write model picker tests**

Create `src/components/header/tabs/ai/AIModelSelector.test.tsx`:

```tsx
// @vitest-environment jsdom

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AIProvider } from '../../../../interfaces/AI';
import { AIModelSelector } from './AIModelSelector';

const providers: AIProvider[] = [
  {
    id: 'enabled-a',
    name: 'Enabled A',
    isEnabled: true,
    apiKey: 'key-a',
    baseUrl: 'https://a.example.com',
    models: [
      { id: 'a-fast', name: 'A Fast' },
      { id: 'a-pro', name: 'A Pro' },
    ],
  },
  {
    id: 'disabled-b',
    name: 'Disabled B',
    isEnabled: false,
    apiKey: 'key-b',
    baseUrl: 'https://b.example.com',
    models: [{ id: 'b-model', name: 'B Model' }],
  },
  {
    id: 'enabled-empty',
    name: 'Enabled Empty',
    isEnabled: true,
    apiKey: '',
    baseUrl: 'https://empty.example.com',
    models: [],
  },
];

describe('AIModelSelector', () => {
  it('shows enabled providers grouped in the popover and hides disabled providers', () => {
    render(
      <AIModelSelector
        aiProviders={providers}
        selectedModel={null}
        onModelChange={vi.fn()}
        onConfigClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /选择模型/ }));

    expect(screen.getByText('Enabled A')).toBeInTheDocument();
    expect(screen.queryByText('Disabled B')).not.toBeInTheDocument();
    expect(screen.getByText('A Fast')).toBeInTheDocument();
    expect(screen.getByText('A Pro')).toBeInTheDocument();
    expect(screen.getByText('Enabled Empty')).toBeInTheDocument();
    expect(screen.getByText('暂无模型')).toBeInTheDocument();
  });

  it('selects a model from the grouped picker', () => {
    const onModelChange = vi.fn();

    render(
      <AIModelSelector
        aiProviders={providers}
        selectedModel={null}
        onModelChange={onModelChange}
        onConfigClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /选择模型/ }));
    fireEvent.click(screen.getByRole('button', { name: /A Pro/ }));

    expect(onModelChange).toHaveBeenCalledWith({ providerId: 'enabled-a', modelId: 'a-pro' });
  });

  it('marks the current selected model', () => {
    render(
      <AIModelSelector
        aiProviders={providers}
        selectedModel={{ providerId: 'enabled-a', modelId: 'a-fast' }}
        onModelChange={vi.fn()}
        onConfigClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /A Fast/ }));

    const selectedRow = screen.getByRole('button', { name: /A Fast/ });
    expect(within(selectedRow).getByText('已选择')).toBeInTheDocument();
  });

  it('opens configuration when no enabled provider has selectable models', () => {
    const onConfigClick = vi.fn();

    render(
      <AIModelSelector
        aiProviders={providers.map(provider => ({ ...provider, isEnabled: false }))}
        selectedModel={null}
        onModelChange={vi.fn()}
        onConfigClick={onConfigClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /配置模型/ }));
    fireEvent.click(screen.getByRole('button', { name: /打开 AI 配置/ }));

    expect(onConfigClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
pnpm test -- src/components/header/tabs/ai/AIModelSelector.test.tsx
```

Expected: FAIL because the current component opens config directly and has no model popover.

- [ ] **Step 3: Replace `AIModelSelector.tsx`**

Replace `src/components/header/tabs/ai/AIModelSelector.tsx` with:

```tsx
import React, { useMemo, useState } from 'react';
import { CheckLine, DownSmallLine, Settings1Line } from '@mingcute/react';
import { AIProvider } from '../../../../interfaces/AI';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AIModelSelectorProps {
  aiProviders: AIProvider[];
  selectedModel: { providerId: string; modelId: string } | null;
  onModelChange: (model: { providerId: string; modelId: string } | null) => void;
  onConfigClick: () => void;
}

function getSelectedModelLabel(
  providers: AIProvider[],
  selectedModel: { providerId: string; modelId: string } | null
) {
  if (!selectedModel) return null;
  const provider = providers.find(item => item.id === selectedModel.providerId);
  const model = provider?.models.find(item => item.id === selectedModel.modelId);
  if (!provider || !model) return null;
  return {
    providerName: provider.name,
    modelName: model.name,
    isEnabled: provider.isEnabled,
    hasApiKey: Boolean(provider.apiKey.trim()),
  };
}

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  aiProviders,
  selectedModel,
  onModelChange,
  onConfigClick,
}) => {
  const [open, setOpen] = useState(false);
  const enabledProviders = useMemo(
    () => aiProviders.filter(provider => provider.isEnabled),
    [aiProviders]
  );
  const selected = getSelectedModelLabel(aiProviders, selectedModel);
  const hasSelectableModels = enabledProviders.some(provider => provider.models.length > 0);
  const triggerLabel = selected?.modelName || (hasSelectableModels ? '选择模型' : '配置模型');
  const statusClass = selected?.isEnabled && selected?.hasApiKey
    ? 'bg-green-500'
    : selected
      ? 'bg-amber-500'
      : 'bg-ui-text-subtle';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex h-7 w-44 items-center justify-between gap-1.5 rounded-ui-control border border-ui-border bg-ui-control px-ui-control-x text-ui-text transition-colors hover:bg-ui-control-hover"
          aria-label={triggerLabel}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span className={cn('size-1.5 shrink-0 rounded-full', statusClass)} />
            <span className="truncate text-left text-[13px]">{triggerLabel}</span>
          </span>
          <DownSmallLine className="size-3.5 shrink-0 text-ui-text-subtle group-hover:text-ui-text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-80 p-2">
        <PopoverHeader className="px-1 pb-2">
          <PopoverTitle className="flex items-center justify-between text-[13px]">
            <span>选择模型</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onConfigClick();
              }}
              className="inline-flex h-6 items-center gap-1 rounded-ui-control px-1.5 text-[12px] text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text"
            >
              <Settings1Line className="size-3.5" />
              AI 配置
            </button>
          </PopoverTitle>
        </PopoverHeader>

        {enabledProviders.length === 0 ? (
          <div className="rounded-ui-panel border border-ui-border-subtle bg-ui-surface-subtle px-3 py-4 text-center text-[13px] text-ui-text-muted">
            <div>没有已启用的平台</div>
            <button
              type="button"
              className="mt-2 h-7 rounded-ui-control bg-brand-500 px-3 text-[13px] font-medium text-white hover:bg-brand-600"
              onClick={() => {
                setOpen(false);
                onConfigClick();
              }}
            >
              打开 AI 配置
            </button>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto pr-1">
            {enabledProviders.map((provider, index) => (
              <div key={provider.id}>
                {index > 0 && <Separator className="my-1" />}
                <div className="px-1 py-1 text-[11px] font-medium text-ui-text-subtle">
                  {provider.name}
                </div>
                {provider.models.length === 0 ? (
                  <div className="px-2 py-1.5 text-[12px] text-ui-text-subtle">暂无模型</div>
                ) : (
                  provider.models.map(model => {
                    const isSelected = selectedModel?.providerId === provider.id && selectedModel.modelId === model.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        className={cn(
                          'flex h-8 w-full items-center justify-between rounded-ui-control px-2 text-left text-[13px] transition-colors hover:bg-ui-control-hover',
                          isSelected && 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                        )}
                        aria-label={model.name}
                        onClick={() => {
                          onModelChange({ providerId: provider.id, modelId: model.id });
                          setOpen(false);
                        }}
                      >
                        <span className="min-w-0 truncate">{model.name}</span>
                        {isSelected && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[11px]">
                            <CheckLine className="size-3.5" />
                            已选择
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
```

- [ ] **Step 4: Run model picker tests and typecheck**

Run:

```bash
pnpm test -- src/components/header/tabs/ai/AIModelSelector.test.tsx
pnpm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/header/tabs/AITab.tsx src/components/header/tabs/ai/AIModelSelector.tsx src/components/header/tabs/ai/AIModelSelector.test.tsx
git commit -m "feat(ai-tab): move model selection into ribbon picker"
```

---

### Task 3: Add Compact Prompt Panel

**Files:**
- Modify: `src/components/header/tabs/ai/AIPromptInput.tsx`
- Create: `src/components/header/tabs/ai/AIPromptInput.test.tsx`

- [ ] **Step 1: Write prompt input tests**

Create `src/components/header/tabs/ai/AIPromptInput.test.tsx`:

```tsx
// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AIPromptInput } from './AIPromptInput';

describe('AIPromptInput', () => {
  it('shows a compact trigger with the current prompt preview', () => {
    render(
      <AIPromptInput
        value="正文仿宋三号，标题黑体"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /正文仿宋三号，标题黑体/ })).toBeInTheDocument();
  });

  it('opens a textarea panel and edits the prompt', () => {
    const onChange = vi.fn();

    render(
      <AIPromptInput
        value=""
        onChange={onChange}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /描述文档样式/ }));
    fireEvent.change(screen.getByRole('textbox', { name: /详细描述样式/ }), {
      target: { value: '正文宋体小四' },
    });

    expect(onChange).toHaveBeenCalledWith('正文宋体小四');
  });

  it('fills template text from a prompt example', () => {
    const onChange = vi.fn();

    render(
      <AIPromptInput
        value=""
        onChange={onChange}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /描述文档样式/ }));
    fireEvent.click(screen.getByRole('button', { name: /公文风格/ }));

    expect(onChange).toHaveBeenCalledWith('正文仿宋三号，标题黑体小二加粗，行距1.5倍');
  });

  it('submits from the panel button', () => {
    const onSubmit = vi.fn();

    render(
      <AIPromptInput
        value="正文宋体小四"
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /正文宋体小四/ }));
    fireEvent.click(screen.getByRole('button', { name: /生成样式/ }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits with Enter from the compact trigger when focused', () => {
    const onSubmit = vi.fn();

    render(
      <AIPromptInput
        value="正文宋体小四"
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.keyDown(screen.getByRole('button', { name: /正文宋体小四/ }), { key: 'Enter' });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
pnpm test -- src/components/header/tabs/ai/AIPromptInput.test.tsx
```

Expected: FAIL because the current component is a raw input without a popover panel.

- [ ] **Step 3: Replace `AIPromptInput.tsx`**

Replace `src/components/header/tabs/ai/AIPromptInput.tsx` with:

```tsx
import React, { useState } from 'react';
import { CloseLine, DownSmallLine } from '@mingcute/react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AIPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const PROMPT_EXAMPLES = [
  {
    label: '公文风格',
    value: '正文仿宋三号，标题黑体小二加粗，行距1.5倍',
  },
  {
    label: '技术文档',
    value: '正文宋体小四，标题微软雅黑小三，代码块灰色背景',
  },
  {
    label: '论文排版',
    value: '正文宋体小四，一级标题黑体三号居中，段前段后间距适中',
  },
];

export const AIPromptInput: React.FC<AIPromptInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = '描述文档样式...',
}) => {
  const [open, setOpen] = useState(false);
  const preview = value.trim() || placeholder;

  const submit = () => {
    if (disabled || !value.trim()) return;
    onSubmit();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
          className={cn(
            'flex h-7 w-full min-w-[320px] max-w-[520px] items-center justify-between gap-2 rounded-ui-control border border-ui-border bg-ui-control px-3 text-left text-[13px] transition-colors hover:bg-ui-control-hover disabled:opacity-50',
            value.trim() ? 'text-ui-text' : 'text-ui-text-subtle'
          )}
          aria-label={preview}
        >
          <span className="truncate">{preview}</span>
          <DownSmallLine className="size-3.5 shrink-0 text-ui-text-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-[540px] p-3">
        <PopoverHeader className="mb-2">
          <PopoverTitle className="flex items-center justify-between text-[13px]">
            <span>描述样式</span>
            {value.trim() && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex h-6 items-center gap-1 rounded-ui-control px-1.5 text-[12px] text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text"
              >
                <CloseLine className="size-3.5" />
                清空
              </button>
            )}
          </PopoverTitle>
        </PopoverHeader>

        <Textarea
          aria-label="详细描述样式"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="min-h-[112px] resize-none text-[13px]"
          placeholder="例如：正文仿宋三号，标题黑体小二加粗，行距1.5倍。也可以描述页边距、代码块、引用、标题层级。"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              submit();
            }
          }}
        />

        <div className="mt-3">
          <div className="mb-1 text-[11px] text-ui-text-subtle">范例</div>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_EXAMPLES.map(example => (
              <button
                key={example.label}
                type="button"
                className="h-7 rounded-ui-control border border-ui-border bg-ui-control px-2 text-[12px] text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text"
                onClick={() => onChange(example.value)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-ui-text-subtle">Ctrl+Enter 生成。生成会覆盖当前样式设置。</div>
          <Button size="sm" onClick={submit} disabled={disabled || !value.trim()}>
            生成样式
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
```

- [ ] **Step 4: Run prompt tests**

Run:

```bash
pnpm test -- src/components/header/tabs/ai/AIPromptInput.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/header/tabs/ai/AIPromptInput.tsx src/components/header/tabs/ai/AIPromptInput.test.tsx
git commit -m "feat(ai-tab): add expandable prompt panel"
```

---

### Task 4: Recompose The Intelligent Ribbon Layout

**Files:**
- Modify: `src/components/header/tabs/AITab.tsx`
- Modify: `src/components/header/tabs/ai/AIGenerateButton.tsx`

- [ ] **Step 1: Replace `AITab.tsx` layout imports**

In `src/components/header/tabs/AITab.tsx`, remove these imports:

```ts
import React, { useEffect, useRef, useState } from 'react';
import { QuestionLine } from '@mingcute/react';
```

Replace with:

```ts
import React from 'react';
import { More2Line } from '@mingcute/react';
```

- [ ] **Step 2: Replace `AITab.tsx` body**

Inside `AITab`, remove `showHelp`, `isClosingHelp`, `helpRef`, `closeHelp`, `handleAnimationEnd`, and the click-outside `useEffect`.

Replace the return JSX with:

```tsx
return (
  <div className="relative flex h-full w-full items-center animate-slide-in-left">
    <div className={STYLES.groupClass}>
      <div className="flex flex-col gap-0.5">
        <span className={STYLES.labelClass}>模型</span>
        <AIModelSelector
          aiProviders={aiProviders}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onConfigClick={() => setShowAIConfig(true)}
        />
      </div>
    </div>

    <div className={`${STYLES.groupClass} min-w-[360px] flex-1 max-w-[560px]`}>
      <div className="flex w-full flex-col gap-0.5">
        <span className={STYLES.labelClass}>样式描述</span>
        <AIPromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleGenerate}
          disabled={isGenerating}
        />
      </div>
    </div>

    <div className={STYLES.groupClass}>
      <div className="flex flex-col gap-0.5">
        <span className={STYLES.labelClass}>应用样式</span>
        <AIGenerateButton
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          isGenerating={isGenerating}
        />
      </div>
    </div>

    <div className={STYLES.groupClass}>
      <div className="flex flex-col gap-0.5">
        <span className={STYLES.labelClass}>更多</span>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-ui-control text-ui-text-muted transition-colors hover:bg-ui-control-hover hover:text-ui-text"
          title="更多 AI 工具"
        >
          <More2Line className="size-4" />
        </button>
      </div>
    </div>

    {error && (
      <div className="absolute left-0 top-full z-50 mt-1 rounded-ui-control border border-red-200 bg-red-50 px-3 py-1.5 text-[13px] text-red-600 shadow-sm animate-fade-in dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        {error}
      </div>
    )}
  </div>
);
```

- [ ] **Step 3: Stabilize generate button width**

Replace `src/components/header/tabs/ai/AIGenerateButton.tsx` with:

```tsx
import React from 'react';
import { AppleIntelligenceLine } from '@mingcute/react';

interface AIGenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  onClick,
  disabled = false,
  isGenerating = false
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 min-w-[88px] items-center justify-center gap-1.5 whitespace-nowrap rounded-ui-control bg-brand-500 px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ui-control-active disabled:text-ui-text-subtle"
    >
      {isGenerating ? (
        <>
          <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          生成中
        </>
      ) : (
        <>
          <AppleIntelligenceLine className="size-3.5" />
          生成样式
        </>
      )}
    </button>
  );
};
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/header/tabs/AITab.tsx src/components/header/tabs/ai/AIGenerateButton.tsx
git commit -m "refactor(ai-tab): compose extensible ribbon layout"
```

---

### Task 5: Remove Model Selection From Config Window

**Files:**
- Modify: `src/components/AIConfigWindow.tsx`
- Modify: `src/hooks/useAIConfig.ts`
- Modify: `src/hooks/useAIConfig.test.tsx`

- [ ] **Step 1: Update `useAIConfig` selection behavior**

In `src/hooks/useAIConfig.ts`, replace `handleSelectModel` with a non-selecting helper for future removal:

```ts
const handleSelectModel = useCallback((_model: AIModel) => {
  // Runtime model selection lives in the Intelligent tab model picker.
}, []);
```

Then remove `handleSelectModel` from the returned object at the bottom.

- [ ] **Step 2: Add deletion cleanup tests**

Append these tests to `src/hooks/useAIConfig.test.tsx`:

```tsx
it('clears selected model when deleting the selected model', () => {
  const updateSelectedModel = vi.fn();
  const providers = [
    {
      ...baseProviders[0],
      models: [
        { id: 'keep-model', name: 'Keep Model' },
        { id: 'delete-model', name: 'Delete Model' },
      ],
    },
    baseProviders[1],
  ];

  const rendered = renderHook(() =>
    useAIConfig({
      providers,
      updateProviders: vi.fn(),
      selectedModel: { providerId: 'builtin', modelId: 'delete-model' },
      updateSelectedModel,
    })
  );

  act(() => {
    rendered.result.current.setSelectedProviderId('builtin');
  });

  act(() => {
    rendered.result.current.handleDeleteModel('delete-model');
  });

  expect(updateSelectedModel).toHaveBeenCalledWith(null);
});

it('clears selected model when deleting the selected custom provider', () => {
  const updateSelectedModel = vi.fn();
  const rendered = renderHook(() =>
    useAIConfig({
      providers: baseProviders,
      updateProviders: vi.fn(),
      selectedModel: { providerId: 'custom-existing', modelId: 'old-model' },
      updateSelectedModel,
    })
  );

  act(() => {
    rendered.result.current.handleDeletePlatform(baseProviders[1]);
  });

  expect(updateSelectedModel).toHaveBeenCalledWith(null);
});
```

- [ ] **Step 3: Run hook tests**

Run:

```bash
pnpm test -- src/hooks/useAIConfig.test.tsx
```

Expected: PASS after selection cleanup is preserved.

- [ ] **Step 4: Remove selected model plumbing from `AIConfigWindow`**

In `src/components/AIConfigWindow.tsx`, replace:

```ts
const { providers, updateProviders, selectedModel, updateSelectedModel } = useAIConfigStore();
```

With:

```ts
const { providers, updateProviders } = useAIConfigStore();
```

Replace the `useAIConfig` call:

```ts
const config = useAIConfig({
  providers,
  updateProviders,
  selectedModel,
  updateSelectedModel,
});
```

With:

```ts
const config = useAIConfig({
  providers,
  updateProviders,
  selectedModel: null,
  updateSelectedModel: () => undefined,
});
```

Remove `handleSelectModel` from the destructuring list:

```ts
handleSelectModel,
```

- [ ] **Step 5: Remove selected model UI from model cards**

In `AIConfigWindow.tsx`, replace the model list map body:

```tsx
{selectedProvider.models.map(model => {
  const isSelected = selectedModel?.providerId === selectedProvider.id && selectedModel?.modelId === model.id;

  return (
    <ContextMenu key={model.id}>
      <ContextMenuTrigger asChild>
        <div
          data-model-card
          className={`flex items-center justify-between p-3 rounded-lg border group cursor-pointer transition-all ${isSelected
            ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 shadow-sm'
            : 'bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm'
            }`}
          onClick={() => handleSelectModel(model)}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isSelected && <CheckLine className="w-4 h-4 text-brand-500" />}
              <span className={`text-sm font-medium ${isSelected ? 'text-brand-700 dark:text-brand-400' : 'text-gray-700 dark:text-gray-200'}`}>{model.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">右键菜单</span>
          </div>
        </div>
      </ContextMenuTrigger>
```

With:

```tsx
{selectedProvider.models.map(model => (
  <ContextMenu key={model.id}>
    <ContextMenuTrigger asChild>
      <div
        data-model-card
        className="flex items-center justify-between p-3 rounded-lg border group cursor-default transition-all bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm"
      >
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{model.name}</span>
          <span className="truncate text-[11px] text-gray-400 dark:text-gray-500">{model.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">右键菜单</span>
        </div>
      </div>
    </ContextMenuTrigger>
```

Also replace the matching closing `});` at the end of the map with `))}`.

- [ ] **Step 6: Clean unused imports**

In `AIConfigWindow.tsx`, remove `CheckLine` if it is no longer used:

```ts
import { Copy2Line, LoadingLine, AddLine, PlayLine, Delete2Line, Edit2Line, Eye2Line, EyeCloseLine, CloseLine } from '@mingcute/react';
```

If `LoadingLine` or `ContextMenuShortcut` is unused after local lint, remove them as well.

- [ ] **Step 7: Run config tests and lint**

Run:

```bash
pnpm test -- src/hooks/useAIConfig.test.tsx
pnpm run lint
pnpm run typecheck
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/AIConfigWindow.tsx src/hooks/useAIConfig.ts src/hooks/useAIConfig.test.tsx
git commit -m "refactor(ai-config): remove runtime model selection"
```

---

### Task 6: Integration Validation

**Files:**
- Inspect: `src/components/header/tabs/AITab.tsx`
- Inspect: `src/components/header/tabs/ai/*`
- Inspect: `src/components/AIConfigWindow.tsx`
- Inspect: `src/hooks/useAIConfig.ts`

- [ ] **Step 1: Run focused test set**

Run:

```bash
pnpm test -- src/components/header/tabs/ai/AIModelSelector.test.tsx src/components/header/tabs/ai/AIPromptInput.test.tsx src/hooks/useAIConfig.test.tsx src/services/aiConfigStore.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full frontend validation**

Run:

```bash
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

Expected: all pass. Build may still print pre-existing chunk-size warnings.

- [ ] **Step 3: Manual smoke test**

Run:

```bash
pnpm run dev
```

Open `http://localhost:3000` and check:

- Intelligent tab shows compact groups and does not stretch the prompt across the whole ribbon.
- Clicking the model button opens a picker grouped by enabled provider.
- Disabled providers do not appear in the picker.
- Clicking `AI 配置` opens the config window.
- Enabling a provider in the config window makes that provider's models appear in the Intelligent tab picker.
- Selecting a model in the picker changes the ribbon label.
- The config window model cards no longer show selected checkmarks and no longer toggle the runtime model.
- Clicking the prompt trigger opens a larger textarea panel.
- Clicking a template fills the prompt.
- Clicking `生成样式` from the panel or ribbon uses the selected model.

- [ ] **Step 4: Commit any polish edits**

If manual smoke test requires small UI polish:

```bash
git add src/components/header/tabs src/components/AIConfigWindow.tsx src/hooks/useAIConfig.ts
git commit -m "fix(ai-tab): polish model picker and prompt panel"
```

If no edits are needed, do not create an empty commit.

---

## Self-Review

- Spec coverage: The plan covers model selection migration, enabled-provider filtering, provider grouping, config-window responsibility reduction, prompt popover panel, and Word-style ribbon layout.
- Placeholder scan: No task contains `TBD`, `TODO`, "implement later", or "similar to previous task".
- Type consistency: `onModelChange`, `selectedModel`, `AIProvider`, and `AIModelSelectorProps` are defined before later tasks use them.
- Scope check: This plan intentionally leaves future AI tools, history, prompt libraries, preview-before-apply, and streaming output for later tabs/groups.
