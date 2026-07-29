
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export async function streamChatMessage(
  history: ChatMessage[],
  onToken: (chunk: string) => void,
  options?: { accent?: string; temperature?: number }
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: history,
      ...(options?.accent ? { accent: options.accent } : {}),
      ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `AI Tutor request failed (${response.status}): ${errorText || response.statusText}`
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // Read the stream until the backend closes it.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onToken(chunk);
  }
}
