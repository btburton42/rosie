/**
 * Chat message component using Lit
 * @module components/chat-message
 */

import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { ChatMessage } from '@app-types/chat.js';

/**
 * Simple markdown parser for chat messages
 * Converts markdown to HTML string
 */
function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text;

  // Escape HTML to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (preserve newlines inside)
  html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const language = lang || '';
    const cleanCode = code.trim();
    return `<pre class="code-block ${language}"><code>${cleanCode}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  const listItems: string[] = [];
  html = html.replace(/^(?:[-*] |\d+\. )(.+)$/gm, (_match, item) => {
    listItems.push(item);
    return '{{LIST_ITEM}}';
  });

  // Process paragraphs and line breaks
  const paragraphs = html.split('\n\n');
  html = paragraphs.map(p => {
    if (p.trim() === '') return '';
    if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote')) return p;
    if (p.includes('{{LIST_ITEM}}')) {
      // It's a list
      const items = p.split('{{LIST_ITEM}}').filter((s: string) => s.trim());
      if (items.length > 0) {
        return `<ul>${items.map((item: string) => `<li>${item}</li>`).join('')}</ul>`;
      }
    }
    // Regular paragraph with line breaks
    p = p.replace(/\n/g, '<br>');
    return `<p>${p}</p>`;
  }).join('');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr>');

  return html;
}

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
      line-height: 1.6;
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

    /* Markdown styles */
    .bubble :first-child {
      margin-top: 0;
    }

    .bubble :last-child {
      margin-bottom: 0;
    }

    .bubble p {
      margin: 0 0 0.75rem 0;
    }

    .bubble h1, .bubble h2, .bubble h3 {
      margin: 1rem 0 0.5rem 0;
      color: var(--rosie-primary, #c41e3a);
      font-weight: 700;
    }

    .bubble h1 {
      font-size: 1.25rem;
    }

    .bubble h2 {
      font-size: 1.1rem;
    }

    .bubble h3 {
      font-size: 1rem;
    }

    .bubble ul, .bubble ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .bubble li {
      margin: 0.25rem 0;
    }

    .bubble strong {
      color: var(--text-color, #e2e2e2);
      font-weight: 700;
    }

    .bubble em {
      font-style: italic;
    }

    .bubble del {
      text-decoration: line-through;
      opacity: 0.7;
    }

    .bubble a {
      color: var(--rosie-primary, #c41e3a);
      text-decoration: underline;
    }

    .bubble a:hover {
      color: var(--rosie-secondary, #1e3a5f);
    }

    .bubble blockquote {
      margin: 0.75rem 0;
      padding: 0.5rem 1rem;
      border-left: 3px solid var(--rosie-primary, #c41e3a);
      background: rgba(255, 255, 255, 0.05);
      font-style: italic;
    }

    .bubble hr {
      border: none;
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
      margin: 1rem 0;
    }

    /* Code styles */
    .code-block {
      background: rgba(0, 0, 0, 0.4);
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 0.75rem 0;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .code-block code {
      font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace;
      font-size: 0.875rem;
      color: #e2e8f0;
      white-space: pre;
    }

    .inline-code {
      font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace;
      font-size: 0.9em;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      color: var(--rosie-accent, #ffd700);
    }

    .message.user .inline-code {
      background: rgba(255, 255, 255, 0.2);
      color: white;
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

  /** Render message content with markdown support */
  private renderContent(): ReturnType<typeof html> {
    const content = this.message.error
      ? `Error: ${this.message.error}`
      : this.message.content;

    const parsedContent = parseMarkdown(content);

    return html`
      <div class="bubble ${this.message.error ? 'error' : ''} ${this.message.isStreaming ? 'streaming' : ''}">
        ${unsafeHTML(parsedContent)}
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
