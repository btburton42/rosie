/**
 * Settings panel component using Lit
 * @module components/settings-panel
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AppSettings, ModelEndpoint, ModelInfo } from '@app-types/chat.js';
import { aiApi } from '@services/ai-api.js';
import { PassphraseAuthElement } from './passphrase-auth.js';

/**
 * Settings panel component for managing endpoints and preferences
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
      max-width: 800px;
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

    .field select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a9ab0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1.25rem;
      padding-right: 2.5rem;
    }

    .field select option {
      background: var(--surface-color, #252538);
      color: var(--text-color, #e2e2e2);
      padding: 0.5rem;
    }

    .field select option:hover,
    .field select option:focus,
    .field select option:checked {
      background: var(--accent-color, #6366f1);
      color: white;
    }

    .field select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      flex: 0 0 auto;
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

    .status.loading {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
    }

    .endpoint-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .endpoint-card {
      background: var(--surface-color, #252538);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .endpoint-card.selected {
      border-color: var(--accent-color, #6366f1);
    }

    .endpoint-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .endpoint-name {
      font-weight: 600;
      color: var(--text-color, #e2e2e2);
    }

    .endpoint-details {
      font-size: 0.875rem;
      color: var(--text-muted, #6b7280);
      font-family: 'SF Mono', Monaco, Consolas, monospace;
    }

    .endpoint-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .endpoint-form {
      background: var(--surface-color, #252538);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .radio-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .radio-group input[type="radio"] {
      width: auto;
    }

    .fetch-models-btn {
      margin-top: 0.5rem;
    }

    .model-select-help {
      font-size: 0.75rem;
      color: var(--text-muted, #6b7280);
      margin-top: 0.25rem;
      font-style: italic;
    }
  `;

  /** Current settings */
  @property({ type: Object })
  settings!: AppSettings;

  @state()
  private _localSettings: AppSettings = {
    selectedEndpointId: '',
    endpoints: [],
    theme: 'rosie',
    fontSize: 'medium',
  };

  @state()
  private _status: { type: 'success' | 'error' | 'loading'; message: string } | null = null;

  @state()
  private _editingEndpoint: ModelEndpoint | null = null;

  @state()
  private _isAddingEndpoint = false;

  @state()
  private _availableModels: ModelInfo[] = [];

  @state()
  private _isFetchingModels = false;

  connectedCallback() {
    super.connectedCallback();
    this._localSettings = { ...this.settings };
  }

  /** Handle input changes for simple fields */
  private handleInput(field: keyof AppSettings, value: string | ModelEndpoint[]) {
    this._localSettings = {
      ...this._localSettings,
      [field]: value,
    };
  }

  /** Select an endpoint */
  private selectEndpoint(endpointId: string) {
    this._localSettings = {
      ...this._localSettings,
      selectedEndpointId: endpointId,
    };
  }

  /** Start adding a new endpoint */
  private startAddEndpoint() {
    this._isAddingEndpoint = true;
    this._editingEndpoint = {
      id: crypto.randomUUID(),
      name: '',
      url: '',
      apiKey: '',
      modelId: '',
      openAICompatible: true,
    };
    this._availableModels = [];
  }

  /** Start editing an endpoint */
  private startEditEndpoint(endpoint: ModelEndpoint) {
    this._editingEndpoint = { ...endpoint };
    this._isAddingEndpoint = false;
    this._availableModels = [];
  }

  /** Cancel editing */
  private cancelEdit() {
    this._editingEndpoint = null;
    this._isAddingEndpoint = false;
    this._availableModels = [];
  }

  /** Fetch available models from the endpoint */
  private async fetchModels() {
    if (!this._editingEndpoint?.url || !this._editingEndpoint?.apiKey) {
      this._status = { type: 'error', message: 'Please enter URL and API key first' };
      return;
    }

    this._isFetchingModels = true;
    this._status = { type: 'loading', message: 'Fetching available models...' };

    // Temporarily set the endpoint to fetch models
    const tempEndpoint: ModelEndpoint = {
      ...this._editingEndpoint,
      id: 'temp',
      name: 'temp',
    };

    aiApi.setEndpoint(tempEndpoint);

    try {
      const models = await aiApi.fetchModels();
      this._availableModels = models;

      if (models.length === 0) {
        this._status = { type: 'error', message: 'No models found. The endpoint may not support /models or the credentials may be invalid.' };
      } else {
        this._status = { type: 'success', message: `Found ${models.length} models` };
        setTimeout(() => this._status = null, 3000);
      }
    } catch (error) {
      this._status = { type: 'error', message: 'Failed to fetch models. Check the URL and API key.' };
    } finally {
      this._isFetchingModels = false;
      // Reset to current selected endpoint
      const currentEndpoint = this._localSettings.endpoints.find(
        (e: ModelEndpoint) => e.id === this._localSettings.selectedEndpointId
      );
      aiApi.setEndpoint(currentEndpoint || null);
    }
  }

  /** Save endpoint (add or update) */
  private saveEndpoint() {
    if (!this._editingEndpoint) return;

    if (!this._editingEndpoint.name || !this._editingEndpoint.url || !this._editingEndpoint.modelId) {
      this._status = { type: 'error', message: 'Name, URL, and Model are required' };
      return;
    }

    const existingIndex = this._localSettings.endpoints.findIndex(
      (e: ModelEndpoint) => e.id === this._editingEndpoint!.id
    );

    let newEndpoints: ModelEndpoint[];
    if (existingIndex >= 0) {
      newEndpoints = [...this._localSettings.endpoints];
      newEndpoints[existingIndex] = this._editingEndpoint;
    } else {
      newEndpoints = [...this._localSettings.endpoints, this._editingEndpoint];
    }

    this._localSettings = {
      ...this._localSettings,
      endpoints: newEndpoints,
    };

    // If this is the first endpoint, select it
    if (newEndpoints.length === 1) {
      this._localSettings.selectedEndpointId = this._editingEndpoint.id;
    }

    this._editingEndpoint = null;
    this._isAddingEndpoint = false;
    this._availableModels = [];
    this._status = { type: 'success', message: 'Endpoint saved!' };
    setTimeout(() => this._status = null, 2000);
  }

  /** Delete an endpoint */
  private deleteEndpoint(endpointId: string) {
    if (!confirm('Are you sure you want to delete this endpoint?')) return;

    const newEndpoints = this._localSettings.endpoints.filter((e: ModelEndpoint) => e.id !== endpointId);

    this._localSettings = {
      ...this._localSettings,
      endpoints: newEndpoints,
      // If we deleted the selected endpoint, select the first available
      selectedEndpointId: this._localSettings.selectedEndpointId === endpointId
        ? (newEndpoints[0]?.id ?? '')
        : this._localSettings.selectedEndpointId,
    };
  }

  /** Update editing endpoint field */
  private updateEditingEndpoint(field: keyof ModelEndpoint, value: string | boolean) {
    if (!this._editingEndpoint) return;
    this._editingEndpoint = {
      ...this._editingEndpoint,
      [field]: value,
    };
  }

  /** Handle model selection from dropdown */
  private handleModelSelect(modelId: string) {
    this.updateEditingEndpoint('modelId', modelId);
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

  /** Reset passphrase */
  private resetPassphrase() {
    if (confirm('Are you sure? This will require setting up a new passphrase.')) {
      PassphraseAuthElement.resetPassphrase();
      alert('Passphrase reset. Please refresh the page.');
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
          <h2>AI Endpoints</h2>
          <p class="help-text">Configure your AI endpoints. Select one to use for conversations.</p>

          ${this._editingEndpoint ? html`
            <div class="endpoint-form">
              <h3>${this._isAddingEndpoint ? 'Add Endpoint' : 'Edit Endpoint'}</h3>
              <div class="field">
                <label for="ep-name">Name</label>
                <input
                  id="ep-name"
                  type="text"
                  .value=${this._editingEndpoint.name}
                  @input=${(e: InputEvent) => this.updateEditingEndpoint('name', (e.target as HTMLInputElement).value)}
                  placeholder="e.g., My OpenAI Proxy"
                />
              </div>
              <div class="field">
                <label for="ep-url">API URL</label>
                <input
                  id="ep-url"
                  type="text"
                  class="token-input"
                  .value=${this._editingEndpoint.url}
                  @input=${(e: InputEvent) => this.updateEditingEndpoint('url', (e.target as HTMLInputElement).value)}
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div class="field">
                <label for="ep-key">API Key</label>
                <input
                  id="ep-key"
                  type="password"
                  class="token-input"
                  .value=${this._editingEndpoint.apiKey}
                  @input=${(e: InputEvent) => this.updateEditingEndpoint('apiKey', (e.target as HTMLInputElement).value)}
                  placeholder="sk-..."
                />
              </div>
              <div class="field">
                <label for="ep-model">Model</label>
                ${this._availableModels.length > 0 ? html`
                  <select
                    id="ep-model"
                    .value=${this._editingEndpoint.modelId}
                    @change=${(e: Event) => this.handleModelSelect((e.target as HTMLSelectElement).value)}
                  >
                    <option value="" ?selected=${!this._editingEndpoint.modelId}>Select a model...</option>
                    ${this._availableModels.map((model: ModelInfo) => html`
                      <option value=${model.id} ?selected=${model.id === this._editingEndpoint!.modelId}>
                        ${model.name || model.id}${model.owned_by ? ` (${model.owned_by})` : ''}
                      </option>
                    `)}
                  </select>
                  <div class="model-select-help">
                    Or fetch models again to refresh the list
                  </div>
                ` : html`
                  <select disabled>
                    <option>Click "Fetch Models" to see available models</option>
                  </select>
                `}
                <button
                  class="btn btn-secondary btn-small fetch-models-btn"
                  @click=${this.fetchModels}
                  ?disabled=${this._isFetchingModels}
                >
                  ${this._isFetchingModels ? 'Fetching...' : 'Fetch Models'}
                </button>
              </div>
              <div class="field">
                <div class="radio-group">
                  <input
                    type="checkbox"
                    id="ep-compatible"
                    .checked=${this._editingEndpoint.openAICompatible}
                    @change=${(e: InputEvent) => this.updateEditingEndpoint('openAICompatible', (e.target as HTMLInputElement).checked)}
                  />
                  <label for="ep-compatible">OpenAI-compatible API</label>
                </div>
              </div>
              <div class="endpoint-actions">
                <button class="btn btn-primary btn-small" @click=${this.saveEndpoint}>Save Endpoint</button>
                <button class="btn btn-secondary btn-small" @click=${this.cancelEdit}>Cancel</button>
              </div>
            </div>
          ` : html`
            <button class="btn btn-primary" @click=${this.startAddEndpoint}>Add Endpoint</button>
          `}

          <div class="endpoint-list">
            ${this._localSettings.endpoints.map((endpoint: ModelEndpoint) => html`
              <div class="endpoint-card ${endpoint.id === this._localSettings.selectedEndpointId ? 'selected' : ''}">
                <div class="endpoint-header">
                  <div class="endpoint-name">${endpoint.name}</div>
                  <div class="radio-group">
                    <input
                      type="radio"
                      name="selectedEndpoint"
                      .checked=${endpoint.id === this._localSettings.selectedEndpointId}
                      @change=${() => this.selectEndpoint(endpoint.id)}
                    />
                    <label>Use this</label>
                  </div>
                </div>
                <div class="endpoint-details">
                  ${endpoint.url} • ${endpoint.modelId}
                </div>
                <div class="endpoint-actions">
                  <button class="btn btn-secondary btn-small" @click=${() => this.startEditEndpoint(endpoint)}>Edit</button>
                  <button class="btn btn-danger btn-small" @click=${() => this.deleteEndpoint(endpoint.id)}>Delete</button>
                </div>
              </div>
            `)}
          </div>
          ${this._localSettings.endpoints.length === 0 ? html`
            <p class="help-text" style="text-align: center; padding: 2rem;">No endpoints configured. Add one to get started!</p>
          ` : ''}
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
              <option value="rosie">Rosie (Default)</option>
              <option value="light">Light</option>
              <option value="workshop">Workshop</option>
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
          <button class="btn btn-secondary" @click=${this.resetPassphrase}>Reset Passphrase</button>
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
