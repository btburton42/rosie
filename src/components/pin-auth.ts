/**
 * Rosie PIN Authentication
 * Welcome screen with retro-futuristic styling
 * @module components/pin-auth
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

/**
 * PIN authentication component for Rosie
 * @element pin-auth
 * @fires {CustomEvent<void>} authenticated - When correct PIN is entered
 */
@customElement('pin-auth')
export class PinAuthElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bg-gradient, linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%));
      padding: 1rem;
      font-family: 'Nunito', sans-serif;
    }

    .auth-container {
      width: 100%;
      max-width: 360px;
      text-align: center;
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .rosie-avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd93d 100%);
      border-radius: 50% 50% 45% 45%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      box-shadow: 
        0 10px 40px rgba(255, 107, 53, 0.4),
        inset 0 -10px 20px rgba(0, 0, 0, 0.2),
        var(--glow-primary, 0 0 30px rgba(255, 107, 53, 0.3));
      animation: float 3s ease-in-out infinite;
      position: relative;
    }

    .rosie-avatar::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 30px;
      background: #ff6b35;
      border-radius: 50%;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(2deg); }
    }

    h1 {
      color: var(--rosie-primary, #ff6b35);
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
    }

    .tagline {
      color: var(--text-muted, #a0a0b0);
      margin: 0 0 2.5rem 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .pin-display {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    .pin-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--rosie-primary, #ff6b35);
      background: transparent;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 0 rgba(255, 107, 53, 0);
    }

    .pin-dot.filled {
      background: var(--rosie-primary, #ff6b35);
      box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
      transform: scale(1.1);
    }

    .pin-dot.error {
      border-color: var(--error-color, #ff6b6b);
      background: rgba(255, 107, 107, 0.2);
      animation: shake 0.5s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-10px); }
      40% { transform: translateX(10px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }

    .keypad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding: 0 1rem;
    }

    .key {
      aspect-ratio: 1;
      border: none;
      border-radius: 50%;
      background: var(--surface-color, rgba(255, 255, 255, 0.08));
      color: var(--text-color, #ffecd1);
      font-size: 1.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 107, 53, 0.1);
    }

    .key:hover {
      background: var(--surface-hover, rgba(255, 107, 53, 0.15));
      transform: scale(1.05);
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(255, 107, 53, 0.15));
    }

    .key:active {
      transform: scale(0.95);
    }

    .key.clear {
      font-size: 1rem;
      background: rgba(255, 107, 53, 0.1);
    }

    .key.clear:hover {
      background: rgba(255, 107, 53, 0.2);
    }

    .error-message {
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 2rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--error-color, #ff6b6b);
      background: rgba(255, 107, 107, 0.1);
      opacity: 0;
      transition: all 0.3s ease;
      transform: translateY(-10px);
    }

    .error-message.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .setup-mode {
      color: var(--rosie-secondary, #f7931e);
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .hint {
      margin-top: 2rem;
      font-size: 0.8rem;
      color: var(--text-muted, #a0a0b0);
      opacity: 0.7;
    }
  `;

  private static readonly PIN_LENGTH = 6;
  private static readonly PIN_HASH_KEY = 'rosie_pin_hash';

  @state()
  private _pin = '';

  @state()
  private _showError = false;

  @state()
  private _isSetupMode = false;

  @state()
  private _confirmPin = '';

  connectedCallback() {
    super.connectedCallback();
    this._checkIfSetupNeeded();
  }

  /** Check if PIN needs to be set up */
  private _checkIfSetupNeeded() {
    const storedHash = localStorage.getItem(PinAuthElement.PIN_HASH_KEY);
    this._isSetupMode = !storedHash;
  }

  /** Hash a PIN using SHA-256 */
  private async _hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /** Handle key press */
  private async _handleKey(key: string) {
    if (this._showError) {
      this._showError = false;
    }

    if (key === 'clear') {
      this._pin = '';
      this._confirmPin = '';
      return;
    }

    if (this._pin.length < PinAuthElement.PIN_LENGTH) {
      this._pin += key;

      if (this._pin.length === PinAuthElement.PIN_LENGTH) {
        await this._processPin();
      }
    }
  }

  /** Process completed PIN entry */
  private async _processPin() {
    if (this._isSetupMode) {
      if (!this._confirmPin) {
        // First entry - ask to confirm
        this._confirmPin = this._pin;
        this._pin = '';
      } else {
        // Confirmation entry
        if (this._pin === this._confirmPin) {
          // Save the PIN hash
          const hash = await this._hashPin(this._pin);
          localStorage.setItem(PinAuthElement.PIN_HASH_KEY, hash);
          this._authenticate();
        } else {
          // PINs don't match
          this._showError = true;
          this._pin = '';
          this._confirmPin = '';
        }
      }
    } else {
      // Normal auth mode
      const storedHash = localStorage.getItem(PinAuthElement.PIN_HASH_KEY);
      const inputHash = await this._hashPin(this._pin);

      if (inputHash === storedHash) {
        this._authenticate();
      } else {
        this._showError = true;
        this._pin = '';
      }
    }
  }

  /** Emit authenticated event */
  private _authenticate() {
    this.dispatchEvent(new CustomEvent('authenticated', {
      bubbles: true,
      composed: true,
    }));
  }

  /** Reset PIN (for settings panel) */
  static resetPin() {
    localStorage.removeItem(PinAuthElement.PIN_HASH_KEY);
  }

  render() {
    const dots = Array(PinAuthElement.PIN_LENGTH).fill(0);

    return html`
      <div class="auth-container">
        <div class="rosie-avatar">🤖</div>
        <h1>${this._isSetupMode ? 'Hello!' : 'Welcome back!'}</h1>
        <p class="tagline">
          ${this._isSetupMode 
            ? (this._confirmPin ? 'Please confirm your PIN' : "I'm Rosie, your AI assistant")
            : 'Enter your PIN to continue'
          }
        </p>

        ${this._isSetupMode && !this._confirmPin ? html`
          <div class="setup-mode">Create a 6-digit PIN to keep your chats private</div>
        ` : this._isSetupMode && this._confirmPin ? html`
          <div class="setup-mode">One more time to confirm ✨</div>
        ` : ''}

        <div class="pin-display">
          ${dots.map((_, i) => html`
            <div class="pin-dot ${i < this._pin.length ? 'filled' : ''} ${this._showError ? 'error' : ''}"></div>
          `)}
        </div>

        <div class="keypad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => html`
            <button class="key" @click=${() => this._handleKey(num.toString())} aria-label="${num}">
              ${num}
            </button>
          `)}
          <button class="key clear" @click=${() => this._handleKey('clear')} aria-label="Clear">
            ⌫
          </button>
          <button class="key" @click=${() => this._handleKey('0')} aria-label="0">
            0
          </button>
          <button class="key" @click=${() => this._handleKey('clear')} aria-label="Clear all">
            ✕
          </button>
        </div>

        <div class="error-message ${this._showError ? 'visible' : ''}">
          ${this._isSetupMode 
            ? "Oops! Those PINs don't match. Let's try again." 
            : "That doesn't look right. Try again!"}
        </div>

        ${!this._isSetupMode ? html`
          <div class="hint">Forgot your PIN? Clear site data to reset</div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pin-auth': PinAuthElement;
  }
}
