/**
 * Type definitions for Rosie - Your Personal AI Assistant
 * @module types/chat
 */

/** Represents a single message in the chat */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** The message content */
  content: string;
  /** Timestamp when the message was created */
  timestamp: Date;
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'system';
  /** Optional error message if the request failed */
  error?: string;
  /** Whether the message is currently being streamed */
  isStreaming?: boolean;
}

/** Configuration for a synthetic.new model */
export interface ModelConfig {
  /** Model identifier (e.g., 'nvidia/Kimi-K2.5-NVFP4') */
  id: string;
  /** Display name for the model */
  name: string;
  /** Maximum tokens for the model */
  maxTokens: number;
  /** Temperature setting (0-2) */
  temperature: number;
}

/** Available models from synthetic.new */
export const AVAILABLE_MODELS: ModelConfig[] = [
  { id: 'nvidia/Kimi-K2.5-NVFP4', name: 'Kimi K2.5', maxTokens: 8192, temperature: 0.7 },
  { id: 'nvidia/Llama-3.1-Nemotron-70B', name: 'Llama 3.1 Nemotron', maxTokens: 4096, temperature: 0.7 },
  { id: 'Qwen/Qwen2.5-Coder-32B', name: 'Qwen2.5 Coder', maxTokens: 4096, temperature: 0.7 },
];

/** Request payload for the synthetic.new API */
export interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

/** Response from the synthetic.new API */
export interface ChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

/** SSE stream chunk from synthetic.new API */
export interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
}

/** Chat conversation state */
export interface Conversation {
  id: string;
  messages: ChatMessage[];
  modelId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Application settings */
export interface AppSettings {
  /** Currently selected model ID */
  selectedModelId: string;
  /** API token for synthetic.new */
  apiToken: string | null;
  /** Theme preference - Rosie themes */
  theme: 'rosie' | 'light' | 'space-age';
  /** Font size preference */
  fontSize: 'small' | 'medium' | 'large';
}
