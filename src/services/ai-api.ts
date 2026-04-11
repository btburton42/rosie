/**
 * Generic AI API Service
 * Communicates with any OpenAI-compatible API endpoint
 * @module services/ai-api
 */

import type { ChatMessage, ChatRequest, StreamChunk, ModelEndpoint, ModelInfo, ModelsResponse } from '@app-types/chat.js';

/** Error thrown when the API service encounters an error */
export class AiApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseText?: string
  ) {
    super(message);
    this.name = 'AiApiError';
  }
}

/** Service for talking to AI endpoints */
export class AiApiService {
  private endpoint: ModelEndpoint | null = null;

  /** Set the endpoint configuration */
  setEndpoint(endpoint: ModelEndpoint | null): void {
    this.endpoint = endpoint;
  }

  /** Get the current endpoint */
  getEndpoint(): ModelEndpoint | null {
    return this.endpoint;
  }

  /** Check if we have a configured endpoint */
  isConfigured(): boolean {
    return !!this.endpoint && !!this.endpoint.apiKey && !!this.endpoint.url;
  }

  /** Get the endpoint display name */
  getEndpointName(): string {
    return this.endpoint?.name ?? 'Unknown';
  }

  /**
   * Send a chat completion request (non-streaming)
   * @param messages - Previous conversation
   * @param temperature - How creative the AI should be
   * @returns AI response
   */
  async chatCompletion(
    messages: ChatMessage[],
    temperature = 0.7
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new AiApiError('No endpoint configured. Please add one in settings.');
    }

    const endpoint = this.endpoint!;

    const requestBody: ChatRequest = {
      model: endpoint.modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: false,
      temperature,
    };

    try {
      const response = await fetch(`${endpoint.url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${endpoint.apiKey}`,
          ...endpoint.headers,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new AiApiError(
          `API error: ${response.statusText}`,
          response.status,
          text
        );
      }

      const data = await response.json();
      return data.choices[0]?.message?.content ?? '';
    } catch (error) {
      if (error instanceof AiApiError) throw error;
      throw new AiApiError(`Network error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    }
  }

  /**
   * Fetch available models from the /models endpoint
   * @returns Array of available model IDs
   */
  async fetchModels(): Promise<ModelInfo[]> {
    if (!this.endpoint) {
      return [];
    }

    try {
      const response = await fetch(`${this.endpoint.url}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.endpoint.apiKey}`,
          ...this.endpoint.headers,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data: ModelsResponse = await response.json();
      return data.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Stream chat completion in real-time
   * @param messages - Previous conversation
   * @param temperature - How creative the AI should be
   * @param onChunk - Called as AI types each word
   * @param onComplete - Called when AI finishes
   * @param onError - Called if something goes wrong
   */
  async streamChatCompletion(
    messages: ChatMessage[],
    temperature: number,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (!this.isConfigured()) {
      onError(new AiApiError('No endpoint configured. Please add one in settings.'));
      return;
    }

    const endpoint = this.endpoint!;

    const requestBody: ChatRequest = {
      model: endpoint.modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
      temperature,
    };

    try {
      const response = await fetch(`${endpoint.url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${endpoint.apiKey}`,
          'Accept': 'text/event-stream',
          ...endpoint.headers,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new AiApiError(
          `API error: ${response.statusText}`,
          response.status,
          text
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new AiApiError('Unable to read response');
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
      if (error instanceof AiApiError) {
        onError(error);
      } else {
        onError(new AiApiError(`Stream error: ${error instanceof Error ? error.message : 'Something went wrong'}`));
      }
    }
  }
}

/** Singleton instance of the AI API service */
export const aiApi = new AiApiService();
