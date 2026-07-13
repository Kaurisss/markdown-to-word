import React from 'react';
import { Eye2Line, EyeCloseLine, Key2Line, Link2Line } from '@mingcute/react';
import { AIProvider } from '../../types/ai';
import { Input } from '../ui/input';
import { PROVIDER_CONSOLE_URLS } from './apiGuide';
import { SettingCard, SettingItem } from '../settings/SettingsLayout';

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
  <div className="space-y-3">
    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
      API 接口配置
    </div>
    <SettingCard>
      <SettingItem
        title="API 密钥 (API Key)"
        description={
          <div>
            <div className="text-gray-400 dark:text-gray-500 text-[11px] leading-normal">用于认证 API 请求的安全密钥，加密保存在本地。</div>
            {PROVIDER_CONSOLE_URLS[provider.id] && (
              <a
                href={PROVIDER_CONSOLE_URLS[provider.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 hover:underline mt-1 font-medium"
              >
                <Link2Line className="w-3.5 h-3.5" />
                获取官方 API 密钥
              </a>
            )}
          </div>
        }
      >
        <div className="relative w-80">
          <Key2Line className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={provider.apiKey}
            onChange={(e) => onUpdate(provider.id, { apiKey: e.target.value })}
            className="w-full pl-9 pr-9 h-9 text-xs bg-white dark:bg-dark-element rounded-lg focus-visible:ring-brand-500"
            placeholder="请输入 API Key"
          />
          <button
            type="button"
            onClick={onToggleShowApiKey}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-dark-element-hover cursor-pointer"
            title={showApiKey ? '隐藏 API Key' : '显示 API Key'}
          >
            {showApiKey ? <EyeCloseLine className="w-4 h-4" /> : <Eye2Line className="w-4 h-4" />}
          </button>
        </div>
      </SettingItem>

      <SettingItem
        title="接口地址 (Base URL)"
        description="该 AI 平台的服务端终点站（例如官方的 https://api.openai.com/v1 或您的代理服务器网关）。"
      >
        <div className="relative w-80">
          <Link2Line className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            type="text"
            value={provider.baseUrl}
            onChange={(e) => onUpdate(provider.id, { baseUrl: e.target.value })}
            className="w-full pl-9 h-9 text-xs bg-white dark:bg-dark-element rounded-lg focus-visible:ring-brand-500"
            placeholder="https://api.example.com/..."
          />
        </div>
      </SettingItem>
    </SettingCard>
  </div>
);
