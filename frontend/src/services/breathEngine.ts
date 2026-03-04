/**
 * Breath Engine — combines prompt assembly + AI call + JSON parsing.
 *
 * Replaces the backend POST /api/breath endpoint.
 * All logic runs in the browser.
 */

import type { Locale } from '../i18n';
import type { AIConfig } from './aiProvider';
import { buildBreathingPrompt } from './promptEngine';
import { chatCompletion } from './aiProvider';

export interface BreathResult {
  danmaku: string[];
  word_cloud: string[];
}

/**
 * Strip markdown fences, <think> tags, and extract the first JSON object.
 * Mirrors the logic from backend/app/routers/breath.py
 */
function parseAIResponse(raw: string): BreathResult {
  let text = raw.trim();

  // Remove <think>...</think> blocks (DeepSeek reasoning)
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // Remove markdown code fences
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/, '');
    text = text.replace(/\s*```$/, '');
  }

  // Find the first { … } block in case AI added conversational text
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    text = text.slice(startIdx, endIdx + 1);
  }

  try {
    const parsed = JSON.parse(text);
    const danmaku = Array.isArray(parsed.danmaku) ? parsed.danmaku : [];
    const word_cloud = Array.isArray(parsed.word_cloud) ? parsed.word_cloud : [];
    return { danmaku, word_cloud };
  } catch {
    // Fallback when parsing fails
    return {
      danmaku: ['(AI响应解析失败，请检查模型)', text.slice(0, 50)],
      word_cloud: [],
    };
  }
}

/**
 * Trigger one breath cycle:
 *   1. Build time-aware prompt
 *   2. Call AI API
 *   3. Parse JSON response
 */
export async function triggerBreath(
  personaPrompt: string,
  customContext: string,
  locale: Locale,
  aiConfig: AIConfig,
): Promise<BreathResult> {
  // 1. Build prompt
  const messages = buildBreathingPrompt(personaPrompt, customContext, locale);

  // 2. Call AI
  const responseText = await chatCompletion(messages, aiConfig);

  // 3. Parse response
  return parseAIResponse(responseText);
}
