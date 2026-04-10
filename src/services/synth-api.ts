/**
 * Service for interacting with the synthetic.new API
 * @module services/synth-api
 */

import type { ChatMessage, ChatRequest, StreamChunk } from '@app-types/chat.js';

const API_BASE_URL = 'https://api.synthetic.new/v1';

/** Error thrown when API requests fail */
export class SynthApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseText?: string
  ) {
    super(message);
    this.name = 'SynthApiError';
  }
}

/** Service for making API calls to synthetic.new */
export class SynthApiService {
  private apiToken: string | null = null;

  /** Set the API token for authentication */
  setToken(token: string | null): void {
    this.apiToken = token;
  }

  /** Get the current API token */
  getToken(): string | null {
    return this.apiToken;
  }

  /** Check if the service has a valid token */
  isAuthenticated(): boolean {
    return !!this.apiToken;
  }

  /**
   * Send a chat completion request (non-streaming)
   * @param messages - Previous messages in the conversation
   * @param model - Model ID to use
   * @param temperature - Temperature setting
   * @returns The assistant's response content
   */
  async chatCompletion(
    messages: ChatMessage[],
    model: string,
    temperature = 0.7
  ): Promise<string> {
    if (!this.apiToken) {
      throw new SynthApiError('No API token set. Please configure your token in settings.');
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
        throw new SynthApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          text
        );
      }

      const data = await response.json();
      return data.choices[0]?.message?.content ?? '';
    } catch (error) {
      if (error instanceof SynthApiError) throw error;
      throw new SynthApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream a chat completion request
   * @param messages - Previous messages in the conversation
   * @param model - Model ID to use
   * @param temperature - Temperature setting
   * @param onChunk - Callback for each chunk received
   * @param onComplete - Callback when streaming completes
   * @param onError - Callback if an error occurs
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
      onError(new SynthApiError('No API token set. Please configure your token in settings.'));
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
        throw new SynthApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          text
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new SynthApiError('Response body is not readable');
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
      if (error instanceof SynthApiError) {
        onError(error);
      } else {
        onError(new SynthApiError(`Stream error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    }
  }
}

/** Singleton instance of the API service */
export const synthApi = new SynthApiService();
