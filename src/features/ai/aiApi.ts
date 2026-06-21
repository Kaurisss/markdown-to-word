/**
 * AI API connectivity testing utilities.
 * Pure functions with no React dependencies.
 */

export interface TestApiConnectionParams {
  baseUrl: string;
  apiKey: string;
  modelId: string;
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
