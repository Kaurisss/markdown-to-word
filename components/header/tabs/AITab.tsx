import React, { useState } from 'react';
import { Settings2, Sparkles } from 'lucide-react';
import { AIProvider } from '../../../interfaces/AI';
import { DocumentConfig } from '../../../interfaces/Config';

interface AITabProps {
  aiProviders: AIProvider[];
  selectedModel: { providerId: string; modelId: string } | null;
  setShowAIConfig: (show: boolean) => void;
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AITab: React.FC<AITabProps> = ({ 
  aiProviders, 
  selectedModel, 
  setShowAIConfig,
  cfg,
  onCfgChange,
  onShowToast
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入样式描述');
      return;
    }

    if (!selectedModel) {
      setError('请先选择 AI 模型');
      return;
    }

    const provider = aiProviders.find(p => p.id === selectedModel.providerId);
    if (!provider || !provider.isEnabled) {
      setError('请先配置并启用 AI 模型');
      return;
    }

    if (!provider.apiKey) {
      setError('请先配置 API Key');
      setShowAIConfig(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const systemPrompt = `你是一个文档样式配置专家。根据用户的描述生成合适的文档样式配置。

请以 JSON 格式返回配置，格式如下：
{
  "global": {
    "pageMargin": 页边距(英寸),
    "baseFontEn": "英文字体名称",
    "baseFontCn": "中文字体名称"
  },
  "styles": {
    "body": {
      "fontSize": 字体大小(磅),
      "lineSpacing": 行距(倍数),
      "firstLineIndent": 首行缩进(字符数),
      "spaceBefore": 段前间距(磅),
      "spaceAfter": 段后间距(磅)
    },
    "h1": { /* 一级标题样式，同body结构 */ },
    "h2": { /* 二级标题样式 */ },
    "h3": { /* 三级标题样式 */ }
  }
}

只返回 JSON，不要包含其他说明文字。确保所有数值都是合理的。`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(provider.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel.modelId,
          messages: [
            { role: 'system', content: systemPrompt },
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

      // 尝试解析 JSON
      let configData;
      try {
        // 提取 JSON（可能被包含在代码块中）
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('AI 返回内容不包含有效的 JSON');
        }
        configData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        throw new Error('解析 AI 返回的配置失败');
      }

      // 合并配置（保留未修改的部分）
      const newConfig: DocumentConfig = {
        global: {
          ...cfg.global,
          ...(configData.global || {})
        },
        styles: {
          body: { ...cfg.styles.body, ...(configData.styles?.body || {}) },
          h1: { ...cfg.styles.h1, ...(configData.styles?.h1 || {}) },
          h2: { ...cfg.styles.h2, ...(configData.styles?.h2 || {}) },
          h3: { ...cfg.styles.h3, ...(configData.styles?.h3 || {}) },
          code: cfg.styles.code,
          quote: cfg.styles.quote
        }
      };

      onCfgChange(newConfig);
      setPrompt('');
      setError(null);
      if (onShowToast) {
        onShowToast('AI 样式生成成功！');
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('请求超时，请重试');
      } else {
        setError(error.message || '生成失败，请重试');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-left w-full pr-2 gap-2">
      <div className="flex items-center gap-2">
        {/* Model Selector & Config */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAIConfig(true)}
            className="group flex items-center gap-2 h-8 px-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-110 transition-transform"></div>
            <span className="text-xs font-medium">
              {(() => {
                if (!selectedModel) return '选择模型';
                const provider = aiProviders.find(p => p.id === selectedModel.providerId);
                const model = provider?.models.find(m => m.id === selectedModel.modelId);
                return provider && model ? `${provider.name}: ${model.name}` : '选择模型';
              })()}
            </span>
          </button>
          
          <button 
            onClick={() => setShowAIConfig(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  handleGenerate();
                }
              }}
              disabled={isGenerating}
              className="w-full h-9 pl-4 pr-10 text-xs rounded-full border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:bg-white dark:focus:bg-dark-surface focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400 disabled:opacity-50"
              placeholder="描述你想要的文档样式：行距1.5倍，首行缩进2字符，标题加粗"
            />
          </div>
        </div>

        {/* Generate Action */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="h-8 px-4 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs rounded-full font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95 disabled:active:scale-100"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              生成样式
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs rounded-lg border border-red-200 dark:border-red-800 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
};
