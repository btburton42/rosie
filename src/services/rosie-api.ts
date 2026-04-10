/**
 * Rosie API Service
 * Communicates with synthetic.new AI models
 * @module services/rosie-api
 */

import type { ChatMessage, ChatRequest, StreamChunk } from '@app-types/chat.js';

const API_BASE_URL = 'https://api.synthetic.new/v1';

/** Error thrown when Rosie can't reach the AI */
export class RosieApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseText?: string
  ) {
    super(message);
    this.name = 'RosieApiError';
  }
}

/** Service for talking to Rosie's AI brain */
export class RosieApiService {
  private apiToken: string | null = null;

  /** Set the API token for Rosie to use */
  setToken(token: string | null): void {
    this.apiToken = token;
  }

  /** Get Rosie's current API token */
  getToken(): string | null {
    return this.apiToken;
  }

  /** Check if Rosie is ready to chat */
  isAuthenticated(): boolean {
    return !!this.apiToken;
  }

  /**
   * Ask Rosie a question (non-streaming)
   * @param messages - Previous conversation
   * @param model - Which AI brain to use
   * @param temperature - How creative Rosie should be
   * @returns Rosie's response
   */
  async chatCompletion(
    messages: ChatMessage[],
    model: string,
    temperature = 0.7
  ): Promise<string> {
    if (!this.apiToken) {
      throw new RosieApiError('Rosie needs an API token to work! Please add one in settings.');
    }

    const requestBody: ChatRequest = {
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: false,
      temperature,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new RosieApiError(
          `Rosie had trouble connecting: ${response.statusText}`,
          response.status,
          text
        );
      }

      const data = await response.json();
      return data.choices[0]?.message?.content ?? '';
    } catch (error) {
      if (error instanceof RosieApiError) throw error;
      throw new RosieApiError(`Network error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    }
  }

  /**
   * Stream Rosie's thoughts in real-time
   * @param messages - Previous conversation
   * @param model - Which AI brain to use
   * @param temperature - How creative Rosie should be
   * @param onChunk - Called as Rosie types each word
   * @param onComplete - Called when Rosie finishes
   * @param onError - Called if something goes wrong
   */
  async streamChatCompletion(
    messages: ChatMessage[],
    model: string,
    temperature: number,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (!this.apiToken) {
      onError(new RosieApiError('Rosie needs an API token! Please add one in settings.'));
      return;
    }

    const requestBody: ChatRequest = {
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
      temperature,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new RosieApiError(
          `Rosie had trouble connecting: ${response.statusText}`,
          response.status,
          text
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new RosieApiError('Unable to read response');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onComplete();
              return;
            }
            try {
              const chunk: StreamChunk = JSON.parse(data);
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      if (error instanceof RosieApiError) {
        onError(error);
      } else {
        onError(new RosieApiError(`Stream error: ${error instanceof Error ? error.message : 'Something went wrong'}`));
      }
    }
  }
}

/** Rosie's brain - singleton instance */
export const rosieApi = new RosieApiService();
