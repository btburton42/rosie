/**
 * Model selector component using Lit
 * @module components/model-selector
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AVAILABLE_MODELS, type ModelConfig } from '@types/chat.js';

/**
 * Component for selecting the AI model
 * @element model-selector
 * @fires {CustomEvent<string>} model-change - When selected model changes
 */
@customElement('model-selector')
export class ModelSelectorElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .selector {
      position: relative;
    }

    .trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--surface-color, #252538);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 0.5rem;
      color: var(--text-color, #e2e2e2);
      font-size: 0.875rem;
      cursor: pointer;
      transition: border-color 0.2s ease;
      min-width: 180px;
    }

    .trigger:hover {
      border-color: var(--accent-color, #6366f1);
    }

    .trigger:focus {
      outline: none;
      border-color: var(--accent-color, #6366f1);
    }

    .trigger svg {
      width: 1rem;
      height: 1rem;
      margin-left: auto;
      transition: transform 0.2s ease;
    }

    .trigger.open svg {
      transform: rotate(180deg);
    }

    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 0.5rem;
      background: var(--surface-color, #252538);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      z-index: 100;
      display: none;
    }

    .dropdown.open {
      display: block;
    }

    .option {
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
      transition: background-color 0.2s ease;
    }

    .option:last-child {
      border-bottom: none;
    }

    .option:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .option.selected {
      background: rgba(99, 102, 241, 0.2);
    }

    .option-name {
      font-weight: 500;
      color: var(--text-color, #e2e2e2);
    }

    .option-id {
      font-size: 0.75rem;
      color: var(--text-muted, #6b7280);
    }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 99;
    }
  `;

  /** Currently selected model ID */
  @property({ type: String })
  selectedId = AVAILABLE_MODELS[0]?.id ?? '';

  @state()
  private _isOpen = false;

  /** Get the selected model config */
  get selectedModel(): ModelConfig | undefined {
    return AVAILABLE_MODELS.find(m => m.id === this.selectedId);
  }

  /** Toggle dropdown visibility */
  private toggleOpen() {
    this._isOpen = !this._isOpen;
  }

  /** Close dropdown */
  private close() {
    this._isOpen = false;
  }

  /** Handle model selection */
  private selectModel(modelId: string) {
    if (modelId !== this.selectedId) {
      this.selectedId = modelId;
      this.dispatchEvent(new CustomEvent('model-change', {
        detail: modelId,
        bubbles: true,
        composed: true,
      }));
    }
    this.close();
  }

  /** Handle keyboard navigation */
  private handleKeydown(e: KeyboardEvent, modelId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.selectModel(modelId);
    } else if (e.key === 'Escape') {
      this.close();
    }
  }

  render() {
    const selected = this.selectedModel;

    return html`
      <div class="selector">
        <button 
          class="trigger ${this._isOpen ? 'open' : ''}"
          @click=${this.toggleOpen}
          aria-haspopup="listbox"
          aria-expanded=${this._isOpen}
        >
          <span>${selected?.name ?? 'Select Model'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        ${this._isOpen ? html`
          <div class="backdrop" @click=${this.close}></div>
          <div 
            class="dropdown ${this._isOpen ? 'open' : ''}"
            role="listbox"
          >
            ${AVAILABLE_MODELS.map(model => html`
              <div
                class="option ${model.id === this.selectedId ? 'selected' : ''}"
                role="option"
                aria-selected=${model.id === this.selectedId}
                tabindex="0"
                @click=${() => this.selectModel(model.id)}
                @keydown=${(e: KeyboardEvent) => this.handleKeydown(e, model.id)}
              >
                <div class="option-name">${model.name}</div>
                <div class="option-id">${model.id}</div>
              </div>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'model-selector': ModelSelectorElement;
  }
}
