/**
 * Settings panel component using Lit
 * @module components/settings-panel
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AppSettings } from '@types/chat.js';
import { PinAuthElement } from './pin-auth.js';

/**
 * Settings panel component for API token and preferences
 * @element settings-panel
 * @fires {CustomEvent<AppSettings>} settings-change - When settings are saved
 * @fires {CustomEvent<void>} close - When panel should be closed
 */
@customElement('settings-panel')
export class SettingsPanelElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      position: fixed;
      inset: 0;
      background: var(--bg-color, #1a1a2e);
      z-index: 200;
      overflow-y: auto;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      position: sticky;
      top: 0;
      background: var(--bg-color, #1a1a2e);
      z-index: 1;
    }

    .header h1 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-color, #e2e2e2);
    }

    .close-btn {
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

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .content {
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    .section {
      margin-bottom: 2rem;
    }

    .section h2 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: var(--text-muted, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .field {
      margin-bottom: 1rem;
    }

    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-color, #e2e2e2);
    }

    .field input,
    .field select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 0.5rem;
      background: var(--surface-color, #252538);
      color: var(--text-color, #e2e2e2);
      font-size: 1rem;
      font-family: inherit;
      box-sizing: border-box;
    }

    .field input:focus,
    .field select:focus {
      outline: none;
      border-color: var(--accent-color, #6366f1);
    }

    .field input::placeholder {
      color: var(--text-muted, #6b7280);
    }

    .help-text {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted, #6b7280);
    }

    .token-input {
      font-family: 'SF Mono', Monaco, Consolas, monospace;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .btn-primary {
      background: var(--accent-color, #6366f1);
      color: white;
    }

    .btn-secondary {
      background: var(--surface-color, #252538);
      color: var(--text-color, #e2e2e2);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .btn-danger {
      background: var(--error-color, #ef4444);
      color: white;
    }

    .status {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .status.success {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .status.error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
  `;

  /** Current settings */
  @property({ type: Object })
  settings!: AppSettings;

  @state()
  private _localSettings: AppSettings = {
    selectedModelId: '',
    apiToken: null,
    theme: 'dark',
    fontSize: 'medium',
  };

  @state()
  private _status: { type: 'success' | 'error'; message: string } | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._localSettings = { ...this.settings };
  }

  /** Handle input changes */
  private handleInput(field: keyof AppSettings, value: string | null) {
    this._localSettings = {
      ...this._localSettings,
      [field]: value,
    };
  }

  /** Save settings */
  private save() {
    this.dispatchEvent(new CustomEvent('settings-change', {
      detail: this._localSettings,
      bubbles: true,
      composed: true,
    }));
    this._status = { type: 'success', message: 'Settings saved successfully!' };
    setTimeout(() => this._status = null, 3000);
  }

  /** Clear all data */
  private clearData() {
    if (confirm('This will delete all conversations and reset settings. Are you sure?')) {
      this.dispatchEvent(new CustomEvent('clear-data', {
        bubbles: true,
        composed: true,
      }));
      this._status = { type: 'success', message: 'All data cleared!' };
    }
  }

  /** Reset PIN */
  private resetPin() {
    if (confirm('This will clear the current PIN and require setup again. You\'ll need to re-enter the app. Continue?')) {
      PinAuthElement.resetPin();
      this._status = { type: 'success', message: 'PIN reset. Reloading...' };
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  /** Close the panel */
  private close() {
    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="header">
        <h1>Settings</h1>
        <button class="close-btn" @click=${this.close} aria-label="Close settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="content">
        <div class="section">
          <h2>API Configuration</h2>
          <div class="field">
            <label for="api-token">API Token</label>
            <input
              id="api-token"
              type="password"
              class="token-input"
              placeholder="sk-..."
              .value=${this._localSettings.apiToken ?? ''}
              @input=${(e: InputEvent) => this.handleInput('apiToken', (e.target as HTMLInputElement).value || null)}
            />
            <div class="help-text">
              Get your API token from <a href="https://synthetic.new" target="_blank" style="color: var(--accent-color);">synthetic.new</a>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Appearance</h2>
          <div class="field">
            <label for="theme">Theme</label>
            <select
              id="theme"
              .value=${this._localSettings.theme}
              @change=${(e: Event) => this.handleInput('theme', (e.target as HTMLSelectElement).value as AppSettings['theme'])}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          <div class="field">
            <label for="font-size">Font Size</label>
            <select
              id="font-size"
              .value=${this._localSettings.fontSize}
              @change=${(e: Event) => this.handleInput('fontSize', (e.target as HTMLSelectElement).value as AppSettings['fontSize'])}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-primary" @click=${this.save}>Save Settings</button>
          <button class="btn btn-secondary" @click=${this.close}>Cancel</button>
        </div>

        <div class="section">
          <h2>Data Management</h2>
          <button class="btn btn-danger" @click=${this.clearData}>Clear All Data</button>
        </div>

        <div class="section">
          <h2>Security</h2>
          <button class="btn btn-secondary" @click=${this.resetPin}>Reset PIN</button>
          <div class="help-text">
            Clear the current PIN and require setup again. You'll need to re-enter the app.
          </div>
        </div>

        ${this._status ? html`
          <div class="status ${this._status.type}">${this._status.message}</div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-panel': SettingsPanelElement;
  }
}
