/**
 * AI Provider — direct fetch to OpenAI-compatible APIs.
 *
 * No SDK needed. The user's API key stays in the browser,
 * never touches any intermediate server.
 */

import type { ChatMessage } from './promptEngine';

export interface AIConfig {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * Call an OpenAI-compatible chat completion endpoint.
 * Returns the raw text content of the first choice.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  config: AIConfig,
  temperature = 0.85,
  maxTokens = 2000,
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('No API key configured. Please set your API key in Settings.');
  }

  // Determine base URL and model from config
  const baseUrl = (config.baseUrl || 'https://api.deepseek.com').replace(/\/+$/, '');
  const model = config.model || 'deepseek-chat';

  const url = `${baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`AI API error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
