/**
 * Chat input component using Lit
 * Retro-futuristic styled input
 * @module components/chat-input
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

/**
 * Props for the ChatInput component
 */
export interface ChatInputProps {
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when message is submitted */
  onSubmit?: (message: string) => void;
}

/**
 * Component for chat message input
 * @element chat-input
 * @fires {CustomEvent<string>} message-submit - When user submits a message
 * @fires {CustomEvent<void>} input-focus - When input is focused
 * @fires {CustomEvent<void>} input-blur - When input is blurred
 */
@customElement('chat-input')
export class ChatInputElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: var(--surface-color, rgba(255, 255, 255, 0.05));
      border-top: 1px solid var(--border-color, rgba(255, 107, 53, 0.2));
      backdrop-filter: blur(10px);
    }

    .input-container {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      max-width: 900px;
      margin: 0 auto;
    }

    .textarea-wrapper {
      flex: 1;
      position: relative;
    }

    textarea {
      width: 100%;
      min-height: 3rem;
      max-height: 200px;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color, rgba(255, 107, 53, 0.2));
      border-radius: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-color, #ffecd1);
      font-size: 1rem;
      font-family: inherit;
      resize: none;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    textarea:focus {
      border-color: var(--rosie-primary, #ff6b35);
      box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
      background: rgba(255, 255, 255, 0.08);
    }

    textarea::placeholder {
      color: var(--text-muted, #a0a0b0);
    }

    textarea:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button {
      width: 3rem;
      height: 3rem;
      border: none;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--rosie-primary, #ff6b35) 0%, var(--rosie-secondary, #f7931e) 100%);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(255, 107, 53, 0.2));
    }

    button:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: var(--shadow-md, 0 4px 16px rgba(255, 107, 53, 0.3));
    }

    button:active:not(:disabled) {
      transform: scale(0.95);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--text-muted, #a0a0b0);
    }

    button svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .hint {
      font-size: 0.75rem;
      color: var(--text-muted, #a0a0b0);
      text-align: center;
      margin-top: 0.5rem;
      opacity: 0.7;
    }
  `;

  /** Whether the input is disabled (e.g., while streaming) */
  @property({ type: Boolean })
  disabled = false;

  /** Placeholder text for the input */
  @property({ type: String })
  placeholder = 'Type your message...';

  @state()
  private _value = '';

  @query('textarea')
  private textarea!: HTMLTextAreaElement;

  /** Get current input value */
  get value(): string {
    return this._value;
  }

  /** Focus the textarea */
  focus() {
    this.textarea?.focus();
  }

  /** Clear the input */
  clear() {
    this._value = '';
    this.adjustTextareaHeight();
  }

  /** Set input value programmatically */
  setValue(value: string) {
    this._value = value;
    this.adjustTextareaHeight();
  }

  /** Handle input changes */
  private handleInput(e: InputEvent) {
    const target = e.target as HTMLTextAreaElement;
    this._value = target.value;
    this.adjustTextareaHeight();
  }

  /** Adjust textarea height based on content */
  private adjustTextareaHeight() {
    if (!this.textarea) return;
    
    this.textarea.style.height = 'auto';
    const newHeight = Math.min(this.textarea.scrollHeight, 200);
    this.textarea.style.height = `${newHeight}px`;
  }

  /** Handle keydown events */
  private handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.submit();
    }
  }

  /** Submit the current message */
  private submit() {
    const trimmed = this._value.trim();
    if (!trimmed || this.disabled) return;

    this.dispatchEvent(new CustomEvent('message-submit', {
      detail: trimmed,
      bubbles: true,
      composed: true,
    }));

    this._value = '';
    this.adjustTextareaHeight();
  }

  private handleFocus() {
    this.dispatchEvent(new CustomEvent('input-focus', {
      bubbles: true,
      composed: true,
    }));
  }

  private handleBlur() {
    this.dispatchEvent(new CustomEvent('input-blur', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="input-container">
        <div class="textarea-wrapper">
          <textarea
            .value=${this._value}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            @input=${this.handleInput}
            @keydown=${this.handleKeydown}
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
            rows="1"
            aria-label="Message input"
          ></textarea>
        </div>
        <button 
          @click=${this.submit} 
          ?disabled=${this.disabled || !this._value.trim()}
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="hint">Press Enter to send, Shift+Enter for new line</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-input': ChatInputElement;
  }
}
