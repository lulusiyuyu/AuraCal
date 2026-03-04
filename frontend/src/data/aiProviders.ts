/**
 * AI Provider presets — migrated from backend/ai_providers.json
 */

export interface AIProviderPreset {
  key: string;
  name: string;
  baseUrl: string;
  model: string;
  description: string;
}

export const aiProviders: AIProviderPreset[] = [
  {
    key: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    description: 'DeepSeek V3, powerful Chinese LLM',
  },
  {
    key: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    description: 'OpenAI GPT series',
  },
  {
    key: 'minimax',
    name: 'MiniMax M2.5',
    baseUrl: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.5',
    description: 'MiniMax Coding Plan, high cost-performance',
  },
];

export const defaultProvider = 'deepseek';
