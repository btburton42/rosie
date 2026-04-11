/**
 * Type definitions for Rosie - AI Chat Interface
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

/** Model information from /models endpoint */
export interface ModelInfo {
  /** Model identifier */
  id: string;
  /** Human-readable name */
  name?: string;
  /** Model description */
  description?: string;
  /** Model owner/provider */
  owned_by?: string;
}

/** Response from /models endpoint */
export interface ModelsResponse {
  /** Array of available models */
  data: ModelInfo[];
}

/** Configuration for a model endpoint */
export interface ModelEndpoint {
  /** Unique identifier for this endpoint configuration */
  id: string;
  /** Display name for this endpoint */
  name: string;
  /** The API endpoint URL */
  url: string;
  /** API key for this endpoint */
  apiKey: string;
  /** Model identifier to use with this endpoint */
  modelId: string;
  /** Optional: Custom headers for this endpoint */
  headers?: Record<string, string>;
  /** Optional: Whether this endpoint follows OpenAI-compatible format */
  openAICompatible: boolean;
}

/** Request payload for chat APIs */
export interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

/** Response from chat APIs */
export interface ChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

/** SSE stream chunk from APIs */
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
  endpointId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Application settings */
export interface AppSettings {
  /** Currently selected endpoint ID */
  selectedEndpointId: string;
  /** Array of configured endpoints */
  endpoints: ModelEndpoint[];
  /** Theme preference */
  theme: 'rosie' | 'light' | 'workshop';
  /** Font size preference */
  fontSize: 'small' | 'medium' | 'large';
}
