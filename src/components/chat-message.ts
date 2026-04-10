/**
 * Chat message component using Lit
 * @module components/chat-message
 */

import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ChatMessage } from '@app-types/chat.js';

/**
 * Component for rendering individual chat messages
 * @element chat-message
 */
@customElement('chat-message')
export class ChatMessageElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    .message {
      display: flex;
      gap: 0.75rem;
      max-width: 100%;
    }

    .message.user {
      flex-direction: row-reverse;
    }

    .avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .message.user .avatar {
      background: var(--accent-color, #6366f1);
      color: white;
    }

    .message.assistant .avatar {
      background: var(--secondary-color, #22d3ee);
      color: var(--bg-color, #1a1a2e);
    }

    .message.system .avatar {
      background: var(--warning-color, #f59e0b);
      color: var(--bg-color, #1a1a2e);
    }

    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      max-width: calc(100% - 3rem);
    }

    .message.user .content-wrapper {
      align-items: flex-end;
    }

    .bubble {
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .message.user .bubble {
      background: var(--accent-color, #6366f1);
      color: white;
      border-bottom-right-radius: 0.25rem;
    }

    .message.assistant .bubble {
      background: var(--surface-color, #252538);
      color: var(--text-color, #e2e2e2);
      border-bottom-left-radius: 0.25rem;
    }

    .message.system .bubble {
      background: var(--warning-color, #f59e0b);
      color: var(--bg-color, #1a1a2e);
    }

    .bubble.error {
      background: var(--error-color, #ef4444) !important;
      color: white !important;
    }

    .bubble.streaming::after {
      content: '▋';
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .timestamp {
      font-size: 0.75rem;
      color: var(--text-muted, #6b7280);
    }

    .message.user .timestamp {
      text-align: right;
    }

    pre {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.75rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 0.5rem 0;
    }

    code {
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 0.875rem;
    }

    p {
      margin: 0 0 0.5rem 0;
    }

    p:last-child {
      margin-bottom: 0;
    }
  `;

  /** The message data to render */
  @property({ type: Object })
  message!: ChatMessage;

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('message') && !this.message) {
      throw new Error('ChatMessageElement requires a message property');
    }
  }

  /** Format timestamp for display */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /** Get avatar text based on role */
  private getAvatarText(): string {
    switch (this.message.role) {
      case 'user': return 'You';
      case 'assistant': return 'AI';
      case 'system': return '!';
      default: return '?';
    }
  }

  /** Render message content with basic markdown support */
  private renderContent(): ReturnType<typeof html> {
    const content = this.message.error 
      ? `Error: ${this.message.error}` 
      : this.message.content;

    // Simple markdown parsing for code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return html`
      <div class="bubble ${this.message.error ? 'error' : ''} ${this.message.isStreaming ? 'streaming' : ''}">
        ${parts.map(part => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.slice(3, -3).trim();
            return html`<pre><code>${code}</code></pre>`;
          }
          return html`<p>${part}</p>`;
        })}
      </div>
    `;
  }

  render() {
    return html`
      <div class="message ${this.message.role}">
        <div class="avatar">${this.getAvatarText()}</div>
        <div class="content-wrapper">
          ${this.renderContent()}
          <div class="timestamp">${this.formatTime(this.message.timestamp)}</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-message': ChatMessageElement;
  }
}
