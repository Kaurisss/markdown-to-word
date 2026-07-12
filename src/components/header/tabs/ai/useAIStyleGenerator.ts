import { useState } from 'react';
import { AIProvider } from '../../../../types/ai';
import { DocumentConfig } from '../../../../types/config';
import { documentConfigSchema, documentConfigPatchSchema } from '../../../../config/documentConfigSchema';

interface UseAIStyleGeneratorProps {
    aiProviders: AIProvider[];
    selectedModel: { providerId: string; modelId: string } | null;
    cfg: DocumentConfig;
    onCfgChange: (cfg: DocumentConfig) => void;
    onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
    onShowConfig: () => void;
}

const SYSTEM_PROMPT = `你是一个文档样式配置专家。根据用户的描述生成合适的文档样式配置。

重要：只返回用户需要修改的配置项，不要返回全部配置。这样可以保留用户之前的其他设置。

可用配置项（只包含需要修改的）：
{
  "global": {
    "pageMargin": 页边距(英寸),
    "baseFontEn": "英文字体名称",
    "baseFontCn": "中文字体名称"
  },
  "styles": {
    "body": {
      "fontFamily": "字体名称(如\\"SimSun\\"/\\"Microsoft YaHei\\"/\\"SimHei\\"/\\"KaiTi\\")",
      "fontSize": 字体大小(磅),
      "lineSpacing": 行距(倍数),
      "firstLineIndent": 首行缩进(字符数),
      "spaceBefore": 段前间距(磅),
      "spaceAfter": 段后间距(磅),
      "bold": 是否加粗(boolean),
      "italic": 是否斜体(boolean),
      "color": 颜色(如"#000000"),
      "alignment": 对齐方式("left"/"center"/"right"/"justify")
    },
    "h1": { /* 一级标题样式，结构同body */ },
    "h2": { /* 二级标题样式 */ },
    "h3": { /* 三级标题样式 */ },
    "code": { /* 代码块样式 */ },
    "quote": { /* 引用块样式 */ }
  }
}

示例：用户说"行距1.5倍，首行缩进2字符"，只需返回：
{"styles":{"body":{"lineSpacing":1.5,"firstLineIndent":2}}}

只返回 JSON，不要包含其他说明文字。确保所有数值都是合理的。`;

export const useAIStyleGenerator = ({
    aiProviders,
    selectedModel,
    cfg,
    onCfgChange,
    onShowToast,
    onShowConfig
}: UseAIStyleGeneratorProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    /**
     * Extract the first balanced JSON object from text. Safer than greedy regex
     * because it handles strings containing braces and markdown code fences.
     */
    const extractJSON = (text: string): unknown | null => {
        const trimmed = text.trim();
        // Fast path: pure JSON response
        try {
            return JSON.parse(trimmed);
        } catch {
            // Not pure JSON — extract embedded object
        }

        // Strip markdown code fences if present
        const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
        const content = fenceMatch ? fenceMatch[1] : trimmed;

        const start = content.indexOf('{');
        if (start === -1) return null;

        let depth = 0;
        let inString = false;
        let escaped = false;

        for (let i = start; i < content.length; i++) {
            const ch = content[i];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === '"') {
                inString = !inString;
                continue;
            }
            if (inString) continue;
            if (ch === '{') depth++;
            else if (ch === '}') {
                depth--;
                if (depth === 0) {
                    try {
                        return JSON.parse(content.substring(start, i + 1));
                    } catch {
                        return null;
                    }
                }
            }
        }
        return null;
    };

    /**
     * Deep merge a validated patch into a base config. Patch values override
     * base values; plain objects are merged recursively.
     */
    const deepMerge = <T>(base: T, patch: unknown): T => {
        if (patch === undefined || patch === null) return base;
        if (typeof base !== 'object' || base === null || typeof patch !== 'object' || patch === null) {
            return patch as T;
        }
        const result = { ...base } as Record<string, unknown>;
        for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
            result[key] = key in result ? deepMerge(result[key], value) : value;
        }
        return result as T;
    };

    const generate = async (prompt: string) => {
        if (!prompt.trim()) {
            onShowToast?.('请输入样式描述', 'error');
            return false;
        }

        if (!selectedModel) {
            onShowToast?.('请先选择 AI 模型', 'error');
            return false;
        }

        const provider = aiProviders.find(p => p.id === selectedModel.providerId);
        if (!provider || !provider.isEnabled) {
            onShowToast?.('请先配置并启用 AI 模型', 'error');
            return false;
        }

        if (!provider.apiKey) {
            onShowToast?.('请先配置 API Key', 'error');
            onShowConfig();
            return false;
        }

        setIsGenerating(true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(provider.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${provider.apiKey}`
                },
                body: JSON.stringify({
                    model: selectedModel.modelId,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMsg = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.error?.message) {
                        errorMsg = errorData.error.message;
                    }
                } catch (e) {
                    // ignore
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('AI 返回内容为空');
            }

            // Step 1: Extract JSON from AI response (handles markdown fences, surrounding text)
            const rawData = extractJSON(content);
            if (rawData === null) {
                throw new Error('AI 返回内容不包含有效的 JSON');
            }

            // Step 2: Validate patch structure with Zod (ensures global/styles are objects)
            const patchResult = documentConfigPatchSchema.safeParse(rawData);
            if (!patchResult.success) {
                throw new Error('AI 返回的配置格式无效');
            }

            // Step 3: Deep merge validated patch into current config
            const merged = deepMerge(cfg, patchResult.data);

            // Step 4: Validate the merged result with the full schema
            const configResult = documentConfigSchema.safeParse(merged);
            if (!configResult.success) {
                throw new Error('AI 返回的配置值无效，可能与现有设置冲突');
            }

            onCfgChange(configResult.data as DocumentConfig);
            if (onShowToast) {
                onShowToast('AI 样式生成成功！', 'success');
            }
            return true;

        } catch (error: any) {
            if (error.name === 'AbortError') {
                onShowToast?.('请求超时，请重试', 'error');
            } else {
                onShowToast?.(error.message || '生成失败，请重试', 'error');
            }
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        generate
    };
};
