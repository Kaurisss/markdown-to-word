import { useState } from 'react';
import { AIProvider } from '../../../../types/ai';
import { DocumentConfig } from '../../../../types/config';

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

    const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T> | undefined): T => {
        if (!source) return target;
        const result = { ...target };
        for (const key of Object.keys(source) as (keyof T)[]) {
            const sourceValue = source[key];
            if (sourceValue === undefined) continue;
            if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue) && target[key] && typeof target[key] === 'object') {
                result[key] = deepMerge(target[key], sourceValue);
            } else {
                result[key] = sourceValue as T[keyof T];
            }
        }
        return result;
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

            // 解析 JSON
            let configData;
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('AI 返回内容不包含有效的 JSON');
                }
                configData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                throw new Error('解析 AI 返回的配置失败');
            }

            // 合并配置
            const newConfig: DocumentConfig = {
                global: deepMerge(cfg.global, configData.global),
                styles: {
                    body: deepMerge(cfg.styles.body, configData.styles?.body),
                    h1: deepMerge(cfg.styles.h1, configData.styles?.h1),
                    h2: deepMerge(cfg.styles.h2, configData.styles?.h2),
                    h3: deepMerge(cfg.styles.h3, configData.styles?.h3),
                    code: deepMerge(cfg.styles.code, configData.styles?.code),
                    quote: deepMerge(cfg.styles.quote, configData.styles?.quote)
                }
            };

            onCfgChange(newConfig);
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
