/**
 * Local storage service for persisting data
 * @module services/storage
 */

import type { Conversation, AppSettings, ModelEndpoint } from '@app-types/chat.js';

const STORAGE_KEYS = {
  conversations: 'rosie_conversations',
  settings: 'rosie_settings',
} as const;

/** Default endpoint configurations */
export const DEFAULT_ENDPOINTS: ModelEndpoint[] = [
  {
    id: 'synthetic-default',
    name: 'synthetic.new',
    url: 'https://api.synthetic.new/v1',
    apiKey: '',
    modelId: 'nvidia/Kimi-K2.5-NVFP4',
    openAICompatible: true,
  },
  {
    id: 'local-llm',
    name: 'Local LLM (OpenAI compatible)',
    url: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    modelId: 'llama2',
    openAICompatible: true,
  },
];

/** Service for persisting data to localStorage */
export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  /** Get the singleton instance */
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /** Get all saved conversations */
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.conversations);
      if (!data) return [];
      const parsed = JSON.parse(data) as Conversation[];
      return parsed.map(c => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
    } catch {
      return [];
    }
  }

  /** Save a conversation */
  saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);

    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.unshift(conversation);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  /** Delete a conversation */
  deleteConversation(id: string): void {
    const conversations = this.getConversations().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
  }

  /** Get app settings */
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.settings);
      if (!data) {
        return this.getDefaultSettings();
      }
      const parsed = JSON.parse(data);
      return { ...this.getDefaultSettings(), ...parsed };
    } catch {
      return this.getDefaultSettings();
    }
  }

  /** Save app settings */
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }

  /** Clear all data */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.conversations);
    localStorage.removeItem(STORAGE_KEYS.settings);
  }

  /** Get default settings */
  private getDefaultSettings(): AppSettings {
    return {
      selectedEndpointId: DEFAULT_ENDPOINTS[0]?.id ?? '',
      endpoints: [...DEFAULT_ENDPOINTS],
      theme: 'rosie',
      fontSize: 'medium',
    };
  }

  /** Get a specific endpoint by ID */
  getEndpoint(endpointId: string): ModelEndpoint | undefined {
    const settings = this.getSettings();
    return settings.endpoints.find(e => e.id === endpointId);
  }

  /** Get the currently selected endpoint */
  getSelectedEndpoint(): ModelEndpoint | undefined {
    const settings = this.getSettings();
    return this.getEndpoint(settings.selectedEndpointId);
  }
}

/** Singleton instance of the storage service */
export const storage = StorageService.getInstance();
