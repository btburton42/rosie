/**
 * Passphrase Authentication
 * Simple text-based authentication with retro-futuristic styling
 * @module components/passphrase-auth
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('PassphraseAuth');
const AUTH_DISABLED = import.meta.env.VITE_DISABLE_AUTH === 'true';

/**
 * Passphrase authentication component
 * @element passphrase-auth
 * @fires {CustomEvent<void>} authenticated - When correct passphrase is entered
 */
@customElement('passphrase-auth')
export class PassphraseAuthElement extends LitElement {
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
      max-width: 400px;
      text-align: center;
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .rosie-avatar {
      width: 100px;
      height: 100px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd93d 100%);
      border-radius: 50% 50% 45% 45%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      box-shadow: 
        0 10px 40px rgba(255, 107, 53, 0.4),
        inset 0 -10px 20px rgba(0, 0, 0, 0.2);
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    h1 {
      color: var(--rosie-primary, #ff6b35);
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 700;
    }

    .tagline {
      color: var(--text-muted, #a0a0b0);
      margin: 0 0 2rem 0;
      font-size: 1rem;
    }

    .setup-mode {
      color: var(--rosie-secondary, #f7931e);
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.75rem;
      background: rgba(247, 147, 30, 0.1);
      border-radius: 0.75rem;
    }

    .input-wrapper {
      position: relative;
      margin-bottom: 1rem;
    }

    input {
      width: 100%;
      padding: 1rem 3rem 1rem 1rem;
      font-size: 1.1rem;
      border: 2px solid rgba(255, 107, 53, 0.3);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-color, #ffecd1);
      font-family: 'Nunito', sans-serif;
      transition: all 0.3s ease;
    }

    input:focus {
      outline: none;
      border-color: var(--rosie-primary, #ff6b35);
      box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
    }

    input::placeholder {
      color: rgba(255, 236, 209, 0.4);
    }

    input.error {
      border-color: var(--error-color, #ff6b6b);
      animation: shake 0.5s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-10px); }
      40% { transform: translateX(10px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }

    .toggle-visibility {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted, #a0a0b0);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
      transition: color 0.2s ease;
    }

    .toggle-visibility:hover {
      color: var(--rosie-primary, #ff6b35);
    }

    button.submit {
      width: 100%;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 1rem;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Nunito', sans-serif;
    }

    button.submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
    }

    button.submit:active:not(:disabled) {
      transform: translateY(0);
    }

    button.submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      color: var(--error-color, #ff6b6b);
      background: rgba(255, 107, 107, 0.1);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .error-message.visible {
      opacity: 1;
    }

    .hint {
      margin-top: 2rem;
      font-size: 0.8rem;
      color: var(--text-muted, #a0a0b0);
      opacity: 0.7;
    }

    .strength-indicator {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      justify-content: center;
    }

    .strength-bar {
      height: 4px;
      flex: 1;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.1);
      transition: background 0.3s ease;
    }

    .strength-bar.weak { background: var(--error-color, #ff6b6b); }
    .strength-bar.medium { background: var(--warning-color, #ffd93d); }
    .strength-bar.strong { background: var(--success-color, #6bcb77); }
  `;

  private static readonly PASSPHRASE_KEY = 'rosie_passphrase_hash';

  @state()
  private _passphrase = '';

  @state()
  private _confirmPassphrase = '';

  @state()
  private _showError = false;

  @state()
  private _isSetupMode = false;

  @state()
  private _isConfirming = false;

  @state()
  private _showPassword = false;

  connectedCallback() {
    super.connectedCallback();
    logger.debug('Component connected');
    
    if (AUTH_DISABLED) {
      logger.info('Auth is disabled via VITE_DISABLE_AUTH');
      this._authenticate();
      return;
    }
    
    this._checkIfSetupNeeded();
  }

  /** Check if passphrase needs to be set up */
  private _checkIfSetupNeeded() {
    const storedHash = localStorage.getItem(PassphraseAuthElement.PASSPHRASE_KEY);
    this._isSetupMode = !storedHash;
    logger.debug('Setup mode:', this._isSetupMode);
  }

  /** Hash a passphrase using SHA-256 */
  private async _hashPassphrase(phrase: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(phrase);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /** Handle input change */
  private _handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (this._isSetupMode && this._isConfirming) {
      this._confirmPassphrase = target.value;
    } else {
      this._passphrase = target.value;
    }
    if (this._showError) {
      this._showError = false;
    }
  }

  /** Toggle password visibility */
  private _toggleVisibility() {
    this._showPassword = !this._showPassword;
  }

  /** Handle form submission */
  private async _handleSubmit(e: Event) {
    e.preventDefault();
    
    if (this._isSetupMode) {
      if (!this._isConfirming) {
        // First entry - validate and move to confirmation
        if (this._passphrase.length < 4) {
          this._showError = true;
          return;
        }
        this._isConfirming = true;
        this._confirmPassphrase = '';
        return;
      }
      
      // Confirmation entry
      if (this._passphrase === this._confirmPassphrase) {
        const hash = await this._hashPassphrase(this._passphrase);
        localStorage.setItem(PassphraseAuthElement.PASSPHRASE_KEY, hash);
        this._authenticate();
      } else {
        this._showError = true;
        this._isConfirming = false;
        this._passphrase = '';
        this._confirmPassphrase = '';
      }
    } else {
      // Normal auth mode
      const storedHash = localStorage.getItem(PassphraseAuthElement.PASSPHRASE_KEY);
      if (!storedHash) {
        this._isSetupMode = true;
        return;
      }
      
      const inputHash = await this._hashPassphrase(this._passphrase);
      if (inputHash === storedHash) {
        this._authenticate();
      } else {
        this._showError = true;
        this._passphrase = '';
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

  /** Reset passphrase (for settings panel) */
  static resetPassphrase() {
    localStorage.removeItem(PassphraseAuthElement.PASSPHRASE_KEY);
  }

  /** Calculate passphrase strength */
  private _getStrength(): number {
    const phrase = this._isSetupMode && this._isConfirming 
      ? this._confirmPassphrase 
      : this._passphrase;
    
    if (phrase.length === 0) return 0;
    if (phrase.length < 6) return 1;
    if (phrase.length < 10) return 2;
    return 3;
  }

  render() {
    const strength = this._getStrength();
    const currentInput = this._isSetupMode && this._isConfirming
      ? this._confirmPassphrase
      : this._passphrase;

    return html`
      <div class="auth-container">
        <div class="rosie-avatar">🤖</div>
        <h1>${this._isSetupMode ? 'Hello!' : 'Welcome back!'}</h1>
        <p class="tagline">
          ${this._isSetupMode
            ? (this._isConfirming ? 'Please confirm your passphrase' : "I'm Rosie, your AI assistant")
            : 'Enter your passphrase to continue'
          }
        </p>

        ${this._isSetupMode && !this._isConfirming ? html`
          <div class="setup-mode">
            Create a memorable passphrase (4+ characters)
          </div>
        ` : this._isSetupMode && this._isConfirming ? html`
          <div class="setup-mode">
            One more time to confirm ✨
          </div>
        ` : ''}

        <form @submit=${this._handleSubmit}>
          <div class="input-wrapper">
            <input
              .type=${this._showPassword ? 'text' : 'password'}
              .value=${currentInput}
              @input=${this._handleInput}
              placeholder=${this._isSetupMode && this._isConfirming 
                ? 'Confirm passphrase...' 
                : 'Enter passphrase...'}
              ?disabled=${this._isSetupMode && this._isConfirming && this._passphrase.length === 0}
              class=${this._showError ? 'error' : ''}
              autocomplete="off"
            />
            <button 
              type="button" 
              class="toggle-visibility"
              @click=${this._toggleVisibility}
              aria-label=${this._showPassword ? 'Hide passphrase' : 'Show passphrase'}
            >
              ${this._showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          ${this._isSetupMode && !this._isConfirming ? html`
            <div class="strength-indicator">
              ${[0, 1, 2].map(i => html`
                <div class="strength-bar ${i < strength ? (strength === 1 ? 'weak' : strength === 2 ? 'medium' : 'strong') : ''}"></div>
              `)}
            </div>
          ` : ''}

          <button type="submit" class="submit" ?disabled=${currentInput.length < (this._isSetupMode ? 4 : 1)}>
            ${this._isSetupMode && !this._isConfirming ? 'Continue' : 'Unlock'}
          </button>
        </form>

        <div class="error-message ${this._showError ? 'visible' : ''}">
          ${this._isSetupMode 
            ? (this._isConfirming ? "Passphrases don't match. Try again." : "Passphrase too short (min 4 characters)")
            : "That doesn't look right. Try again!"}
        </div>

        ${!this._isSetupMode ? html`
          <div class="hint">Forgot your passphrase? Clear site data to reset</div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'passphrase-auth': PassphraseAuthElement;
  }
}
