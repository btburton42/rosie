/**
 * Main application entry point
 * @module app
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { storage } from '@services/storage.js';
import { rosieApi } from '@services/rosie-api.js';
import '@components/chat-container.js';
import '@components/settings-panel.js';
import '@components/pin-auth.js';

/**
 * Rosie - Your Personal AI Assistant
 * Root application component with retro-futuristic theming
 * @element rosie-app
 */
@customElement('rosie-app')
export class RosieApp extends LitElement {
  @state()
  private _isAuthenticated = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Rosie Theme - Retro-Futuristic Space Age */
    :host([theme="rosie"]) {
      /* Primary Colors */
      --bg-color: #2a2a3e;
      --bg-gradient: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
      --surface-color: rgba(255, 255, 255, 0.08);
      --surface-hover: rgba(255, 255, 255, 0.12);
      
      /* Rosie Orange Palette */
      --rosie-primary: #ff6b35;
      --rosie-secondary: #f7931e;
      --rosie-accent: #ffd93d;
      --rosie-dark: #e85d04;
      
      /* Text Colors */
      --text-color: #ffecd1;
      --text-muted: #a0a0b0;
      --text-inverse: #2a2a3e;
      
      /* Functional Colors */
      --accent-color: #ff6b35;
      --secondary-color: #22d3ee;
      --border-color: rgba(255, 107, 53, 0.3);
      --error-color: #ff6b6b;
      --warning-color: #ffd93d;
      --success-color: #6bcb77;
      
      /* Shadows */
      --shadow-sm: 0 2px 8px rgba(255, 107, 53, 0.15);
      --shadow-md: 0 4px 16px rgba(255, 107, 53, 0.25);
      --shadow-lg: 0 8px 32px rgba(255, 107, 53, 0.35);
      
      /* Glow Effects */
      --glow-primary: 0 0 20px rgba(255, 107, 53, 0.4);
      --glow-secondary: 0 0 20px rgba(34, 211, 238, 0.4);
    }

    :host([theme="light"]) {
      --bg-color: #faf8f5;
      --bg-gradient: linear-gradient(135deg, #faf8f5 0%, #f5f0e8 100%);
      --surface-color: rgba(255, 107, 53, 0.05);
      --surface-hover: rgba(255, 107, 53, 0.1);
      
      --rosie-primary: #ff6b35;
      --rosie-secondary: #f7931e;
      --rosie-accent: #ffd93d;
      
      --text-color: #2a2a3e;
      --text-muted: #6b6b7b;
      --text-inverse: #faf8f5;
      
      --accent-color: #ff6b35;
      --secondary-color: #0891b2;
      --border-color: rgba(255, 107, 53, 0.2);
      --error-color: #dc2626;
      --warning-color: #f59e0b;
      --success-color: #16a34a;
      
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
      --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
      --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
      
      --glow-primary: 0 0 20px rgba(255, 107, 53, 0.3);
      --glow-secondary: 0 0 20px rgba(8, 145, 178, 0.3);
    }

    /* Space Age Theme */
    :host([theme="space-age"]) {
      --bg-color: #0f0f1a;
      --bg-gradient: linear-gradient(180deg, #0f0f1a 0%, #1a1a3e 50%, #2a1a3e 100%);
      --surface-color: rgba(100, 200, 255, 0.08);
      --surface-hover: rgba(100, 200, 255, 0.15);
      
      --rosie-primary: #64c8ff;
      --rosie-secondary: #a855f7;
      --rosie-accent: #f0abfc;
      
      --text-color: #e0f2fe;
      --text-muted: #94a3b8;
      --text-inverse: #0f0f1a;
      
      --accent-color: #64c8ff;
      --secondary-color: #a855f7;
      --border-color: rgba(100, 200, 255, 0.3);
      --error-color: #f87171;
      --warning-color: #fcd34d;
      --success-color: #34d399;
      
      --shadow-sm: 0 2px 8px rgba(100, 200, 255, 0.15);
      --shadow-md: 0 4px 16px rgba(100, 200, 255, 0.25);
      --shadow-lg: 0 8px 32px rgba(100, 200, 255, 0.35);
      
      --glow-primary: 0 0 30px rgba(100, 200, 255, 0.5);
      --glow-secondary: 0 0 30px rgba(168, 85, 247, 0.5);
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
    this.initializeApp();
  }

  /** Initialize Rosie app settings */
  private initializeApp() {
    const settings = storage.getSettings();
    
    // Set theme - default to Rosie theme
    if (settings.theme === 'system') {
      // Rosie doesn't use system theme - always use Rosie theme
      this.setAttribute('theme', 'rosie');
    } else {
      this.setAttribute('theme', settings.theme || 'rosie');
    }
    
    // Set font size
    this.setAttribute('font-size', settings.fontSize);
    
    // Initialize API token
    rosieApi.setToken(settings.apiToken);
  }

  /** Handle successful authentication */
  private handleAuthenticated() {
    this._isAuthenticated = true;
  }

  render() {
    if (!this._isAuthenticated) {
      return html`
        <div class="app">
          <pin-auth @authenticated=${this.handleAuthenticated}></pin-auth>
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
