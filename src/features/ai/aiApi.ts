/**
 * AI API connectivity testing utilities.
 * Pure functions with no React dependencies.
 */

export interface TestApiConnectionParams {
  baseUrl: string;
  apiKey: string;
  modelId: string;
}

export function deriveModelsUrl(baseUrl: string): string {
  let url = baseUrl.trim().replace(/\/+$/, '');
  if (url.endsWith('/chat/completions')) {
    return url.replace(/\/chat\/completions$/, '/models');
  }
  if (url.endsWith('/models')) {
    return url;
  }
  return `${url}/models`;
}

export interface FetchRemoteModelsParams {
  baseUrl: string;
  apiKey: string;
}

export interface RemoteModel {
  id: string;
}

export async function fetchRemoteModels({ baseUrl, apiKey }: FetchRemoteModelsParams): Promise<RemoteModel[]> {
  if (!apiKey) {
    throw new Error('缺少 API Key');
  }
  if (!baseUrl) {
    throw new Error('Base URL 不合法');
  }

  const modelsUrl = deriveModelsUrl(baseUrl);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(modelsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    throw new Error('网络错误');
  }

  try {
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.data)) {
      throw new Error('响应结构不符合预期 (缺少 data 数组)');
    }

    const models = data.data.filter((m: any) => m && m.id).map((m: any) => ({ id: m.id }));
    if (models.length === 0 && data.data.length > 0) {
      throw new Error('响应结构不符合预期 (缺少 id 字段)');
    }

    return models;
  } finally {
    clearTimeout(timeoutId);
  }
}


/**
 * Send a minimal chat completion request to test API connectivity.
 * Resolves with a success message including latency, or throws with an error description.
 */
export async function testApiConnection({ baseUrl, apiKey, modelId }: TestApiConnectionParams): Promise<string> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Say "Test success"' }],
        max_tokens: 10,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMsg = errorData.error.message;
        }
      } catch {
        // ignore parse errors
      }
      throw new Error(errorMsg);
    }

    return `连接成功 (${duration}ms)`;
  } finally {
    clearTimeout(timeoutId);
  }
}
