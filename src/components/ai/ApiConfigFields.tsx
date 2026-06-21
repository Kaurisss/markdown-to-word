import React from 'react';
import { Eye2Line, EyeCloseLine, Key2Line, Link2Line } from '@mingcute/react';
import { AIProvider } from '../../types/ai';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PROVIDER_CONSOLE_URLS } from './apiGuide';

interface ApiConfigFieldsProps {
  provider: AIProvider;
  onUpdate: (id: string, patch: Partial<AIProvider>) => void;
  showApiKey: boolean;
  onToggleShowApiKey: () => void;
}

export const ApiConfigFields: React.FC<ApiConfigFieldsProps> = ({
  provider,
  onUpdate,
  showApiKey,
  onToggleShowApiKey,
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="ui-section-title">
        API 配置
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="ui-field-label">API Key</Label>
        {PROVIDER_CONSOLE_URLS[provider.id] && (
          <a
            href={PROVIDER_CONSOLE_URLS[provider.id]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
            title="前往官网获取 API Key"
          >
            <Link2Line className="w-3.5 h-3.5" />
            获取密钥
          </a>
        )}
      </div>
      <div className="relative">
        <Key2Line className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type={showApiKey ? 'text' : 'password'}
          value={provider.apiKey}
          onChange={(e) => onUpdate(provider.id, { apiKey: e.target.value })}
          className="w-full pl-9 pr-9 bg-white dark:bg-dark-element"
          placeholder="请输入 API Key"
        />
        <button
          type="button"
          onClick={onToggleShowApiKey}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-dark-element-hover"
          title={showApiKey ? '隐藏 API Key' : '显示 API Key'}
        >
          {showApiKey ? <EyeCloseLine className="w-4 h-4" /> : <Eye2Line className="w-4 h-4" />}
        </button>
      </div>
    </div>

    <div className="space-y-2">
      <Label className="ui-field-label">Base URL</Label>
      <div className="relative">
        <Link2Line className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          value={provider.baseUrl}
          onChange={(e) => onUpdate(provider.id, { baseUrl: e.target.value })}
          className="w-full pl-9 bg-white dark:bg-dark-element"
          placeholder="https://api.example.com/..."
        />
      </div>
    </div>
  </div>
);
