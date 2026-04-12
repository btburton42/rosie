/**
 * Chat Container
 * Main chat interface with conversation sidebar
 * @module components/chat-container
 */

import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ChatMessage, Conversation, AppSettings, ModelEndpoint } from '@app-types/chat.js';
import { aiApi } from '@services/ai-api.js';
import { storage } from '@services/storage.js';
import { createLogger } from '../utils/logger.js';
import './chat-message.js';
import './chat-input.js';
import './endpoint-selector.js';

const logger = createLogger('ChatContainer');

/**
 * The main chat interface with conversation history
 * @element chat-container
 */
@customElement('chat-container')
export class ChatContainerElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      height: 100vh;
      height: 100dvh;
      background: var(--bg-gradient, linear-gradient(135deg, #1e2a3a 0%, #0f1a2e 100%));
      font-family: 'Nunito', sans-serif;
    }

    .sidebar {
      width: 280px;
      background: var(--surface-color, #2d3a4a);
      border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
    }

    .new-chat-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
      border-radius: 0.5rem;
      background: var(--rosie-primary, #c41e3a);
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .new-chat-btn:hover {
      background: #a31830;
      transform: translateY(-1px);
    }

    .sidebar-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted, #8a9ab0);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 1rem 1rem 0.5rem;
    }

    .conversation-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .conversation-list::-webkit-scrollbar {
      width: 4px;
    }

    .conversation-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .conversation-list::-webkit-scrollbar-thumb {
      background: var(--border-color, rgba(255, 255, 255, 0.2));
      border-radius: 2px;
    }

    .conversation-item {
      padding: 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      margin-bottom: 0.25rem;
      transition: background-color 0.2s ease;
      border: 1px solid transparent;
    }

    .conversation-item:hover {
      background: var(--surface-hover, #3a4a5a);
    }

    .conversation-item.active {
      background: rgba(196, 30, 58, 0.15);
      border-color: var(--rosie-primary, #c41e3a);
    }

    .conversation-title {
      font-size: 0.875rem;
      color: var(--text-color, #f5f5f5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.25rem;
    }

    .conversation-meta {
      font-size: 0.75rem;
      color: var(--text-muted, #8a9ab0);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .conversation-delete {
      opacity: 0;
      background: none;
      border: none;
      color: var(--text-muted, #8a9ab0);
      cursor: pointer;
      padding: 0.125rem;
      font-size: 1rem;
      transition: opacity 0.2s ease;
    }

    .conversation-item:hover .conversation-delete {
      opacity: 1;
    }

    .conversation-delete:hover {
      color: var(--error-color, #ef4444);
    }

    .no-conversations {
      padding: 2rem 1rem;
      text-align: center;
      color: var(--text-muted, #8a9ab0);
      font-size: 0.875rem;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      background: var(--surface-color, rgba(255, 255, 255, 0.05));
      backdrop-filter: blur(10px);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .menu-btn {
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      background: transparent;
      color: var(--text-color, #e2e2e2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      transition: background-color 0.2s ease;
    }

    .menu-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .rosie-logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--rosie-primary, #c41e3a) 0%, var(--rosie-secondary, #1e3a5f) 100%);
      border-radius: 50% 50% 45% 45%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(196, 30, 58, 0.2));
    }

    .rosie-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--rosie-primary, #c41e3a);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .settings-btn {
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      background: transparent;
      color: var(--text-color, #e2e2e2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      transition: background-color 0.2s ease;
    }

    .settings-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
    }

    .messages::-webkit-scrollbar {
      width: 6px;
    }

    .messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .messages::-webkit-scrollbar-thumb {
      background: var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 3px;
    }

    .welcome {
      text-align: center;
      color: var(--text-muted, #8a9ab0);
      margin: auto;
      padding: 2rem;
    }

    .welcome h2 {
      margin: 0 0 0.5rem 0;
      color: var(--text-color, #f5f5f5);
    }

    .welcome p {
      margin: 0;
    }

    .api-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      background: var(--surface-color, #2d3a4a);
    }

    .api-status.authenticated {
      color: #22c55e;
    }

    .api-status.unauthenticated {
      color: #ef4444;
    }

    .indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .endpoint-display {
      font-size: 0.75rem;
      color: var(--text-muted, #8a9ab0);
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Mobile sidebar toggle */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 100;
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .sidebar-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
      }

      .sidebar-backdrop.open {
        display: block;
      }
    }

    @media (min-width: 769px) {
      .menu-btn {
        display: none;
      }
    }

    /* Import Context Modal */
    .import-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      padding: 1rem;
    }

    .import-modal-content {
      background: var(--surface-color, #2d3a4a);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      border-radius: 0.75rem;
      width: 100%;
      max-width: 500px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .import-modal-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .import-modal-header h3 {
      margin: 0;
      color: var(--text-color, #f5f5f5);
    }

    .import-modal-close {
      background: none;
      border: none;
      color: var(--text-muted, #8a9ab0);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
    }

    .import-modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-color, #f5f5f5);
    }

    .import-modal-body {
      padding: 1rem;
      overflow-y: auto;
    }

    .import-field {
      margin-bottom: 1rem;
    }

    .import-field label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-color, #f5f5f5);
    }

    .import-field select,
    .import-field input[type="range"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      border-radius: 0.5rem;
      background: var(--bg-color, #1e2a3a);
      color: var(--text-color, #f5f5f5);
      font-size: 0.875rem;
    }

    .import-field select option {
      background: var(--surface-color, #2d3a4a);
      color: var(--text-color, #f5f5f5);
      padding: 0.5rem;
    }

    .import-range-value {
      text-align: center;
      font-size: 0.875rem;
      color: var(--rosie-primary, #c41e3a);
      margin-top: 0.25rem;
    }

    .import-modal-footer {
      padding: 1rem;
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      display: flex;
      gap: 0.75rem;
    }

    .import-btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .import-btn-primary {
      background: var(--rosie-primary, #c41e3a);
      color: white;
    }

    .import-btn-primary:hover {
      background: #a31830;
    }

    .import-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .import-btn-secondary {
      background: transparent;
      color: var(--text-color, #f5f5f5);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
    }

    .import-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .import-context-btn {
      width: 100%;
      padding: 0.5rem;
      margin-top: 0.5rem;
      border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.3));
      border-radius: 0.5rem;
      background: transparent;
      color: var(--text-muted, #8a9ab0);
      font-size: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .import-context-btn:hover {
      border-color: var(--rosie-primary, #c41e3a);
      color: var(--rosie-primary, #c41e3a);
    }

    .help-text {
      font-size: 0.75rem;
      color: var(--text-muted, #8a9ab0);
      margin-top: 0.5rem;
      line-height: 1.4;
    }

    /* Rename conversation styles */
    .conversation-rename-input {
      width: 100%;
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--rosie-primary, #c41e3a);
      border-radius: 0.25rem;
      background: var(--bg-color, #1e2a3a);
      color: var(--text-color, #f5f5f5);
      font-size: 0.875rem;
      font-family: inherit;
    }

    .conversation-rename-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(196, 30, 58, 0.3);
    }

    .conversation-actions {
      display: flex;
      gap: 0.25rem;
    }

    .conversation-action-btn {
      background: none;
      border: none;
      color: var(--text-muted, #8a9ab0);
      cursor: pointer;
      padding: 0.125rem;
      font-size: 0.875rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .conversation-item:hover .conversation-action-btn {
      opacity: 1;
    }

    .conversation-action-btn:hover {
      color: var(--rosie-primary, #c41e3a);
    }

    .conversation-action-btn.delete:hover {
      color: var(--error-color, #ef4444);
    }
  `;

  @property({ type: String })
  conversationId = '';

  @state()
  private _messages: ChatMessage[] = [];

  @state()
  private _isStreaming = false;

  @state()
  private _endpointId = '';

  @state()
  private _showSettings = false;

  @state()
  private _settings: AppSettings = storage.getSettings();

  @state()
  private _currentEndpoint: ModelEndpoint | null = null;

  @state()
  private _conversations: Conversation[] = [];

  @state()
  private _sidebarOpen = false;

  @state()
  private _showImportModal = false;

  @state()
  private _importConversationId: string | null = null;

  @state()
  private _importMessageCount = 10;

  @state()
  private _editingConversationId: string | null = null;

  @state()
  private _editTitleValue = '';

  willUpdate(changedProperties: PropertyValues<this>) {
    // When conversationId changes, reload the conversation
    if (changedProperties.has('conversationId')) {
      setTimeout(() => this.loadConversation(), 0);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateEndpoint();
    this._loadConversations();
    // Delay loading conversation to ensure properties are set
    setTimeout(() => this.loadConversation(), 0);
  }

  /** Load all conversations for the sidebar */
  private _loadConversations() {
    this._conversations = storage.getConversations().sort(
      (a: Conversation, b: Conversation) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /** Update the current endpoint based on settings */
  private _updateEndpoint() {
    const endpoint = storage.getSelectedEndpoint();
    if (endpoint) {
      this._currentEndpoint = endpoint;
      this._endpointId = endpoint.id;
      aiApi.setEndpoint(endpoint);
    }
  }

  /** Load existing conversation */
  private loadConversation() {
    if (this.conversationId) {
      const conversations = storage.getConversations();
      const conversation = conversations.find((c: Conversation) => c.id === this.conversationId);
      if (conversation) {
        // Deep clone the messages to ensure reactivity
        this._messages = JSON.parse(JSON.stringify(conversation.messages));
        this._endpointId = conversation.endpointId;
        // Update API endpoint
        const endpoint = storage.getEndpoint(this._endpointId);
        if (endpoint) {
          aiApi.setEndpoint(endpoint);
        }
      }
    } else {
      // Start fresh
      this._messages = [];
      const settings = storage.getSettings();
      if (settings.selectedEndpointId) {
        this._endpointId = settings.selectedEndpointId;
        const endpoint = storage.getEndpoint(this._endpointId);
        if (endpoint) {
          aiApi.setEndpoint(endpoint);
        }
      }
    }
  }

  /** Start a new conversation */
  private _newChat() {
    this.conversationId = '';
    this._messages = [];
    this._sidebarOpen = false;
    // Keep the current endpoint
    this.requestUpdate();
  }

  /** Select a conversation from history */
  private _selectConversation(conversationId: string) {
    this.conversationId = conversationId;
    this._sidebarOpen = false;
    this.loadConversation();
    // Force a re-render
    this._messages = [...this._messages];
  }

  /** Delete a conversation */
  private _deleteConversation(e: Event, conversationId: string) {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    storage.deleteConversation(conversationId);
    this._loadConversations();

    // If we deleted the current conversation, start a new one
    if (this.conversationId === conversationId) {
      this._newChat();
    }
  }

  /** Start renaming a conversation */
  private _startRename(e: Event, conversation: Conversation) {
    e.stopPropagation();
    this._editingConversationId = conversation.id;
    this._editTitleValue = conversation.title;
  }

  /** Save the renamed conversation */
  private _saveRename(e: Event) {
    e.stopPropagation();
    if (!this._editingConversationId || !this._editTitleValue.trim()) {
      this._cancelRename();
      return;
    }

    const conversation = this._conversations.find((c: Conversation) => c.id === this._editingConversationId);
    if (conversation) {
      conversation.title = this._editTitleValue.trim();
      conversation.updatedAt = new Date();
      storage.saveConversation(conversation);
      this._loadConversations();
    }
    this._cancelRename();
  }

  /** Cancel renaming */
  private _cancelRename() {
    this._editingConversationId = null;
    this._editTitleValue = '';
  }

  /** Handle rename input */
  private _handleRenameInput(e: InputEvent) {
    this._editTitleValue = (e.target as HTMLInputElement).value;
  }

  /** Handle rename keydown */
  private _handleRenameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this._saveRename(e);
    } else if (e.key === 'Escape') {
      this._cancelRename();
    }
  }

  /** Show import context modal */
  private _showImportContext() {
    this._showImportModal = true;
    this._importConversationId = null;
    this._importMessageCount = 10;
  }

  /** Close import modal */
  private _closeImportModal() {
    this._showImportModal = false;
    this._importConversationId = null;
  }

  /** Import context from another conversation */
  private _importContext() {
    if (!this._importConversationId) return;

    const conversation = this._conversations.find((c: Conversation) => c.id === this._importConversationId);
    if (!conversation) return;

    // Get the last N messages from the selected conversation
    const messagesToImport = conversation.messages.slice(-this._importMessageCount).map((m: ChatMessage) => ({
      ...m,
      id: crypto.randomUUID(), // New IDs for imported messages
      timestamp: new Date(),
    }));

    // Add system message to indicate context import
    const contextMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: `📎 *Context imported from "${conversation.title}" (${messagesToImport.length} messages)*`,
      timestamp: new Date(),
      role: 'system',
    };

    this._messages = [...this._messages, contextMessage, ...messagesToImport];
    this._closeImportModal();
    this.saveConversation();
    this.scrollToBottom();
  }

  /** Save current conversation */
  private saveConversation() {
    if (this._messages.length === 0) return;

    const conversation: Conversation = {
      id: this.conversationId || crypto.randomUUID(),
      messages: [...this._messages],
      endpointId: this._endpointId,
      title: this._messages[0]?.content.slice(0, 50) || 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    storage.saveConversation(conversation);

    // Update local state
    if (!this.conversationId) {
      this.conversationId = conversation.id;
    }
    this._loadConversations();
  }

  /** Handle new message submission */
  private async handleMessageSubmit(e: CustomEvent<string>) {
    const content = e.detail;

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      timestamp: new Date(),
      role: 'user',
    };

    this._messages = [...this._messages, userMessage];
    this.scrollToBottom();
    this.saveConversation();

    // Start streaming response
    await this.streamResponse();
  }

  /** Stream response from the API */
  private async streamResponse() {
    if (!aiApi.isConfigured()) {
      this.addErrorMessage('Please configure an endpoint in settings');
      return;
    }

    this._isStreaming = true;
    const streamingId = crypto.randomUUID();

    const assistantMessage: ChatMessage = {
      id: streamingId,
      content: '',
      timestamp: new Date(),
      role: 'assistant',
      isStreaming: true,
    };

    this._messages = [...this._messages, assistantMessage];
    this.scrollToBottom();

    let streamedContent = '';

    await aiApi.streamChatCompletion(
      this._messages,
      0.7,
      (chunk) => {
        streamedContent += chunk;
        this._messages = this._messages.map((m: ChatMessage) =>
          m.id === streamingId
            ? { ...m, content: streamedContent }
            : m
        );
        this.scrollToBottom();
      },
      () => {
        this._messages = this._messages.map((m: ChatMessage) =>
          m.id === streamingId
            ? { ...m, isStreaming: false }
            : m
        );
        this._isStreaming = false;
        this.saveConversation();
      },
      (error) => {
        this._messages = this._messages.filter((m: ChatMessage) => m.id !== streamingId);
        this.addErrorMessage(error.message);
        this._isStreaming = false;
      }
    );
  }

  /** Add an error message to the chat */
  private addErrorMessage(error: string) {
    const errorMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: '',
      timestamp: new Date(),
      role: 'system',
      error,
    };
    this._messages = [...this._messages, errorMessage];
    this.scrollToBottom();
  }

  /** Scroll messages to bottom */
  private scrollToBottom() {
    setTimeout(() => {
      const messagesEl = this.shadowRoot?.querySelector('.messages');
      if (messagesEl) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    }, 0);
  }

  /** Handle endpoint change */
  private handleEndpointChange(e: CustomEvent<string>) {
    this._endpointId = e.detail;
    const endpoint = storage.getEndpoint(this._endpointId);
    if (endpoint) {
      this._currentEndpoint = endpoint;
      aiApi.setEndpoint(endpoint);
    }
    this.saveConversation();
  }

  /** Handle settings open */
  private openSettings() {
    logger.debug('Settings button clicked');
    this._showSettings = true;
  }

  /** Handle settings save */
  private handleSettingsChange(e: CustomEvent<AppSettings>) {
    this._settings = e.detail;
    storage.saveSettings(this._settings);
    this._updateEndpoint();
    this._showSettings = false;
  }

  /** Handle settings close */
  private closeSettings() {
    this._showSettings = false;
  }

  /** Toggle sidebar on mobile */
  private _toggleSidebar() {
    this._sidebarOpen = !this._sidebarOpen;
  }

  /** Format date for display */
  private _formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  render() {
    if (this._showSettings) {
      return html`
        <settings-panel
          .settings=${this._settings}
          @settings-change=${this.handleSettingsChange}
          @close=${this.closeSettings}
        ></settings-panel>
      `;
    }

    const isConfigured = aiApi.isConfigured();
    const endpointName = this._currentEndpoint?.name ?? 'No Endpoint';

    return html`
      <div class="sidebar ${this._sidebarOpen ? 'open' : ''}">
        <div class="sidebar-header">
          <button class="new-chat-btn" @click=${this._newChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chat
          </button>
        </div>

        <div class="sidebar-title">History</div>

        <div class="conversation-list">
          ${this._conversations.length === 0 ? html`
            <div class="no-conversations">
              No conversations yet
            </div>
          ` : this._conversations.map((conv: Conversation) => html`
            <div
              class="conversation-item ${conv.id === this.conversationId ? 'active' : ''}"
              @click=${() => this._selectConversation(conv.id)}
            >
              ${this._editingConversationId === conv.id ? html`
                <input
                  class="conversation-rename-input"
                  .value=${this._editTitleValue}
                  @input=${this._handleRenameInput}
                  @keydown=${this._handleRenameKeydown}
                  @blur=${this._saveRename}
                  @click=${(e: Event) => e.stopPropagation()}
                  autofocus
                />
              ` : html`
                <div class="conversation-title">${conv.title}</div>
              `}
              <div class="conversation-meta">
                <span>${this._formatDate(conv.updatedAt)}</span>
                <div class="conversation-actions">
                  ${this._editingConversationId === conv.id ? '' : html`
                    <button
                      class="conversation-action-btn"
                      @click=${(e: Event) => this._startRename(e, conv)}
                      title="Rename conversation"
                    >
                      ✏️
                    </button>
                    <button
                      class="conversation-action-btn delete"
                      @click=${(e: Event) => this._deleteConversation(e, conv.id)}
                      title="Delete conversation"
                    >
                      🗑️
                    </button>
                  `}
                </div>
              </div>
            </div>
          `)}
        </div>

        ${this._conversations.length > 0 && this._messages.length > 0 ? html`
          <div style="padding: 0 1rem 1rem;">
            <button class="import-context-btn" @click=${this._showImportContext}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Import Context
            </button>
          </div>
        ` : ''}
      </div>

      <div class="sidebar-backdrop ${this._sidebarOpen ? 'open' : ''}" @click=${() => this._sidebarOpen = false}></div>

      <div class="main-content">
        <div class="header">
          <div class="header-left">
            <button class="menu-btn" @click=${this._toggleSidebar} aria-label="Toggle menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div class="rosie-logo">🤖</div>
            <div class="rosie-name">Rosie</div>
            <endpoint-selector
              .selectedId=${this._endpointId}
              @endpoint-change=${this.handleEndpointChange}
            ></endpoint-selector>
          </div>
          <div class="header-right">
            <div class="endpoint-display" title="${endpointName}">${endpointName}</div>
            <div class="api-status ${isConfigured ? 'authenticated' : 'unauthenticated'}">
              <div class="indicator"></div>
              ${isConfigured ? 'Connected' : 'No Endpoint'}
            </div>
            <button class="settings-btn" @click=${this.openSettings} aria-label="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 17.66l-4.24 4.24M23 12h-6m-6 0H1m20.24 4.24l-4.24-4.24M6.34 6.34L2.1 2.1"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="messages">
          ${this._messages.length === 0 ? html`
            <div class="welcome">
              <h2>Hello! 🤖</h2>
              <p>I'm Rosie, your AI assistant.</p>
              <p style="margin-top: 0.5rem; font-size: 0.9rem;">How can I help you today?</p>
              ${!isConfigured ? html`
                <p style="margin-top: 1rem; color: var(--rosie-secondary, #1e3a5f);">
                  Configure an API endpoint in settings to get started!
                </p>
              ` : ''}
            </div>
          ` : this._messages.map(msg => html`
            <chat-message .message=${msg}></chat-message>
          `)}
        </div>

        <chat-input
          ?disabled=${this._isStreaming}
          @message-submit=${this.handleMessageSubmit}
        ></chat-input>
      </div>

      ${this._showImportModal ? html`
        <div class="import-modal" @click=${(e: Event) => { if (e.target === e.currentTarget) this._closeImportModal(); }}>
          <div class="import-modal-content">
            <div class="import-modal-header">
              <h3>📎 Import Context</h3>
              <button class="import-modal-close" @click=${this._closeImportModal}>×</button>
            </div>
            <div class="import-modal-body">
              <div class="import-field">
                <label for="import-conversation">Select conversation</label>
                <select
                  id="import-conversation"
                  .value=${this._importConversationId || ''}
                  @change=${(e: Event) => this._importConversationId = (e.target as HTMLSelectElement).value}
                >
                  <option value="">Choose a conversation...</option>
                  ${this._conversations
                    .filter((c: Conversation) => c.id !== this.conversationId)
                    .map((conv: Conversation) => html`
                      <option value=${conv.id}>${conv.title} (${conv.messages.length} messages)</option>
                    `)}
                </select>
              </div>

              <div class="import-field">
                <label for="import-count">Number of recent messages to import</label>
                <input
                  id="import-count"
                  type="range"
                  min="1"
                  max="50"
                  .value=${this._importMessageCount}
                  @input=${(e: InputEvent) => this._importMessageCount = parseInt((e.target as HTMLInputElement).value)}
                />
                <div class="import-range-value">${this._importMessageCount} messages</div>
              </div>

              <div class="help-text">
                Importing context will add messages from the selected conversation to your current chat.
                This helps the AI understand previous discussions without starting over.
              </div>
            </div>
            <div class="import-modal-footer">
              <button class="import-btn import-btn-secondary" @click=${this._closeImportModal}>Cancel</button>
              <button
                class="import-btn import-btn-primary"
                @click=${this._importContext}
                ?disabled=${!this._importConversationId}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-container': ChatContainerElement;
  }
}
