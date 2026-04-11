/**
 * Main application entry point
 * @module app
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { storage } from '@services/storage.js';
import { aiApi } from '@services/ai-api.js';
import { createLogger } from './utils/logger.js';
import '@components/chat-container.js';
import '@components/settings-panel.js';
import '@components/passphrase-auth.js';

const logger = createLogger('App');
const AUTH_DISABLED = import.meta.env.VITE_DISABLE_AUTH === 'true';

/**
 * Rosie - AI Chat Interface
 * Root application component with utilitarian theming
 * @element rosie-app
 */
@customElement('rosie-app')
export class RosieApp extends LitElement {
  @state()
  private _isAuthenticated!: boolean;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Rosie Theme - Industrial/Utilitarian (Rosie the Riveter inspired) */
    :host([theme="rosie"]) {
      /* Industrial Navy & Steel */
      --bg-color: #1e2a3a;
      --bg-gradient: linear-gradient(135deg, #1e2a3a 0%, #0f1a2e 100%);
      --surface-color: #2d3a4a;
      --surface-hover: #3a4a5a;

      /* Rosie Colors - Red, White, Blue */
      --rosie-primary: #c41e3a;       /* Classic red */
      --rosie-secondary: #1e3a5f;     /* Navy blue */
      --rosie-accent: #ffd700;        /* Industrial gold/brass */
      --rosie-dark: #0a1628;

      /* Text Colors */
      --text-color: #f5f5f5;
      --text-muted: #8a9ab0;
      --text-inverse: #1a1a2e;

      /* Functional Colors */
      --accent-color: #c41e3a;
      --secondary-color: #4a7c9b;
      --border-color: rgba(255, 255, 255, 0.15);
      --error-color: #e63946;
      --warning-color: #ffd700;
      --success-color: #2a9d8f;

      /* Industrial Shadows */
      --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
      --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);

      /* Subtle Glow */
      --glow-primary: 0 0 15px rgba(196, 30, 58, 0.3);
      --glow-secondary: 0 0 15px rgba(30, 58, 95, 0.4);
    }

    :host([theme="light"]) {
      --bg-color: #f0f4f8;
      --bg-gradient: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
      --surface-color: rgba(30, 58, 95, 0.05);
      --surface-hover: rgba(30, 58, 95, 0.1);

      --rosie-primary: #c41e3a;
      --rosie-secondary: #1e3a5f;
      --rosie-accent: #b8860b;

      --text-color: #1a202c;
      --text-muted: #4a5568;
      --text-inverse: #f7fafc;

      --accent-color: #c41e3a;
      --secondary-color: #1e3a5f;
      --border-color: rgba(30, 58, 95, 0.2);
      --error-color: #c53030;
      --warning-color: #d69e2e;
      --success-color: #276749;

      --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
      --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);

      --glow-primary: 0 0 15px rgba(196, 30, 58, 0.2);
      --glow-secondary: 0 0 15px rgba(30, 58, 95, 0.2);
    }

    /* Workshop Theme - Dark industrial */
    :host([theme="workshop"]) {
      --bg-color: #1a1a1a;
      --bg-gradient: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
      --surface-color: rgba(255, 255, 255, 0.08);
      --surface-hover: rgba(255, 255, 255, 0.12);

      --rosie-primary: #ff6b35;       /* Welding torch orange */
      --rosie-secondary: #4a5568;     /* Steel gray */
      --rosie-accent: #f6e05e;         /* Warning yellow */

      --text-color: #e2e8f0;
      --text-muted: #718096;
      --text-inverse: #1a1a1a;

      --accent-color: #ff6b35;
      --secondary-color: #4a5568;
      --border-color: rgba(255, 107, 53, 0.2);
      --error-color: #fc8181;
      --warning-color: #f6e05e;
      --success-color: #68d391;

      --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.5);
      --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.6);
      --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.7);

      --glow-primary: 0 0 20px rgba(255, 107, 53, 0.4);
      --glow-secondary: 0 0 20px rgba(74, 85, 104, 0.4);
    }

    :host([font-size="small"]) {
      font-size: 14px;
    }

    :host([font-size="medium"]) {
      font-size: 16px;
    }

    :host([font-size="large"]) {
      font-size: 18px;
    }

    .app {
      width: 100%;
      height: 100vh;
      height: 100dvh;
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text-color);
      background: var(--bg-gradient);
      overflow: hidden;
    }
  `;

  constructor() {
    super();

    // Initialize the state property properly
    this._isAuthenticated = false;

    // Check if auth is disabled via env var
    if (AUTH_DISABLED) {
      logger.info('Auth disabled via VITE_DISABLE_AUTH - auto-authenticating');
      this._isAuthenticated = true;
    }

    this.initializeApp();
  }

  /** Initialize app settings */
  private initializeApp() {
    const settings = storage.getSettings();

    // Set theme - default to Rosie theme
    this.setAttribute('theme', settings.theme || 'rosie');

    // Set font size
    this.setAttribute('font-size', settings.fontSize);

    // Initialize API endpoint
    const endpoint = storage.getSelectedEndpoint();
    if (endpoint) {
      aiApi.setEndpoint(endpoint);
    }
  }

  /** Handle successful authentication */
  private handleAuthenticated() {
    this._isAuthenticated = true;
  }

  render() {
    if (!this._isAuthenticated) {
      return html`
        <div class="app">
          <passphrase-auth @authenticated=${this.handleAuthenticated}></passphrase-auth>
        </div>
      `;
    }

    return html`
      <div class="app">
        <chat-container></chat-container>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rosie-app': RosieApp;
  }
}
