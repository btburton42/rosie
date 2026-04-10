/**
 * Local storage service for persisting Rosie's data
 * @module services/storage
 */

import type { Conversation, AppSettings } from '@types/chat.js';
import { AVAILABLE_MODELS } from '@types/chat.js';

const STORAGE_KEYS = {
  conversations: 'rosie_conversations',
  settings: 'rosie_settings',
} as const;

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
      return { ...this.getDefaultSettings(), ...JSON.parse(data) };
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
      selectedModelId: AVAILABLE_MODELS[0]?.id ?? '',
      apiToken: null,
      theme: 'rosie',
      fontSize: 'medium',
    };
  }
}

/** Singleton instance of the storage service */
export const storage = StorageService.getInstance();
