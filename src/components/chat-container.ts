/**
 * Rosie Chat Container
 * Main chat interface with retro-futuristic styling
 * @module components/chat-container
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ChatMessage, Conversation, AppSettings } from '@types/chat.js';
import { AVAILABLE_MODELS } from '@types/chat.js';
import { rosieApi } from '@services/rosie-api.js';
import { storage } from '@services/storage.js';
import './chat-message.js';
import './chat-input.js';
import './model-selector.js';

/**
 * Rosie's chat interface
 * @element chat-container
 */
@customElement('chat-container')
export class ChatContainerElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      background: var(--bg-gradient, linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%));
      font-family: 'Nunito', sans-serif;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color, rgba(255, 107, 53, 0.2));
      background: var(--surface-color, rgba(255, 255, 255, 0.05));
      backdrop-filter: blur(10px);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .rosie-logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd93d 100%);
      border-radius: 50% 50% 45% 45%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(255, 107, 53, 0.2));
    }

    .rosie-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--rosie-primary, #ff6b35);
      text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
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
      color: var(--text-muted, #6b7280);
      margin: auto;
      padding: 2rem;
    }

    .welcome h2 {
      margin: 0 0 0.5rem 0;
      color: var(--text-color, #e2e2e2);
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
      background: var(--surface-color, #252538);
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
  `;

  @property({ type: String })
  conversationId = '';

  @state()
  private _messages: ChatMessage[] = [];

  @state()
  private _isStreaming = false;

  @state()
  private _modelId = AVAILABLE_MODELS[0]?.id ?? '';

  @state()
  private _showSettings = false;

  @state()
  private _settings: AppSettings = storage.getSettings();

  private _currentStreamingId: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.loadConversation();
    rosieApi.setToken(this._settings.apiToken);
  }

  /** Load existing conversation */
  private loadConversation() {
    if (this.conversationId) {
      const conversations = storage.getConversations();
      const conversation = conversations.find(c => c.id === this.conversationId);
      if (conversation) {
        this._messages = conversation.messages;
        this._modelId = conversation.modelId;
      }
    }
  }

  /** Save current conversation */
  private saveConversation() {
    if (this._messages.length === 0) return;

    const conversation: Conversation = {
      id: this.conversationId || crypto.randomUUID(),
      messages: this._messages,
      modelId: this._modelId,
      title: this._messages[0]?.content.slice(0, 50) || 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    storage.saveConversation(conversation);
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
    if (!rosieApi.isAuthenticated()) {
      this.addErrorMessage('Please set your API token in settings');
      return;
    }

    this._isStreaming = true;
    const streamingId = crypto.randomUUID();
    this._currentStreamingId = streamingId;

    const assistantMessage: ChatMessage = {
      id: streamingId,
      content: '',
      timestamp: new Date(),
      role: 'assistant',
      isStreaming: true,
    };

    this._messages = [...this._messages, assistantMessage];
    this.scrollToBottom();

    const model = AVAILABLE_MODELS.find(m => m.id === this._modelId);
    const temperature = model?.temperature ?? 0.7;

    let streamedContent = '';

    await rosieApi.streamChatCompletion(
      this._messages,
      this._modelId,
      temperature,
      (chunk) => {
        streamedContent += chunk;
        this._messages = this._messages.map(m =>
          m.id === streamingId
            ? { ...m, content: streamedContent }
            : m
        );
        this.scrollToBottom();
      },
      () => {
        this._messages = this._messages.map(m =>
          m.id === streamingId
            ? { ...m, isStreaming: false }
            : m
        );
        this._isStreaming = false;
        this._currentStreamingId = null;
        this.saveConversation();
      },
      (error) => {
        this._messages = this._messages.filter(m => m.id !== streamingId);
        this.addErrorMessage(error.message);
        this._isStreaming = false;
        this._currentStreamingId = null;
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

  /** Handle model change */
  private handleModelChange(e: CustomEvent<string>) {
    this._modelId = e.detail;
    this.saveConversation();
  }

  /** Handle settings open */
  private openSettings() {
    this._showSettings = true;
  }

  /** Handle settings save */
  private handleSettingsChange(e: CustomEvent<AppSettings>) {
    this._settings = e.detail;
    storage.saveSettings(this._settings);
    rosieApi.setToken(this._settings.apiToken);
    this._showSettings = false;
  }

  /** Handle settings close */
  private closeSettings() {
    this._showSettings = false;
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

    const isAuthenticated = rosieApi.isAuthenticated();

    return html`
      <div class="header">
        <div class="header-left">
          <div class="rosie-logo">🤖</div>
          <div class="rosie-name">Rosie</div>
          <model-selector
            .selectedId=${this._modelId}
            @model-change=${this.handleModelChange}
          ></model-selector>
        </div>
        <div class="header-right">
          <div class="api-status ${isAuthenticated ? 'authenticated' : 'unauthenticated'}">
            <div class="indicator"></div>
            ${isAuthenticated ? 'Connected' : 'No API Token'}
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
            <h2>Hi there! 🤖</h2>
            <p>I'm Rosie, your personal AI assistant.</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">How can I help you today?</p>
            ${!isAuthenticated ? html`
              <p style="margin-top: 1rem; color: var(--rosie-secondary, #f7931e);">
                ⚡ Please add your API token in settings so I can assist you!
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-container': ChatContainerElement;
  }
}
