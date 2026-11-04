export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; truncated?: boolean }
  | { type: 'error'; message: string };

export const MAX_MESSAGE_CHARS = 1200;
export const MAX_HISTORY_CHARS = 6000;
export const MAX_MESSAGES = 9;
export const DEFAULT_EXPIRY = '2026-11-25T15:00:00.000Z';

export function validateMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || !value.length || value.length > MAX_MESSAGES || value.length % 2 !== 1) return null;
  let total = 0;
  const result: ChatMessage[] = [];
  for (const [index, message] of value.entries()) {
    const role = index % 2 === 0 ? 'user' : 'assistant';
    if (!message || typeof message !== 'object' || message.role !== role || typeof message.content !== 'string') return null;
    const content = message.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARS) return null;
    total += content.length;
    result.push({ role, content });
  }
  return total <= MAX_HISTORY_CHARS ? result : null;
}

export function recentMessages(history: ChatMessage[], question: string): ChatMessage[] {
  const messages: ChatMessage[] = [...history.slice(-(MAX_MESSAGES - 1)), { role: 'user', content: question }];
  while (messages.length > 1 && messages.reduce((sum, m) => sum + m.content.length, 0) > MAX_HISTORY_CHARS) messages.splice(0, 2);
  return messages;
}
