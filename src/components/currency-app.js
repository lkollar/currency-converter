import { LitElement, html, css } from "lit";
import { currencyStore } from "../store/currency-store.js";
import { currencyAPI } from "../services/currency-api.js";
import "./currency-grid.js";

export class CurrencyApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-sans);
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      min-height: 100vh;
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 0;
      position: relative;
    }

    .header::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: var(--color-primary-gradient);
      border-radius: 2px;
      margin-bottom: 1rem;
    }

    .title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-gray-900);
      margin: 1rem 0 0.5rem 0;
      line-height: var(--line-height-tight);
      background: var(--color-primary-gradient);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-family: var(--font-family-sans);
      font-size: var(--font-size-lg);
      color: var(--color-gray-600);
      margin: 0;
      font-weight: var(--font-weight-normal);
      line-height: var(--line-height-relaxed);
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      color: var(--color-gray-600);
      font-size: var(--font-size-lg);
    }

    .error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: var(--color-error);
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
      font-family: var(--font-family-sans);
      font-size: var(--font-size-sm);
      backdrop-filter: var(--backdrop-blur-sm);
    }

    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      margin-top: 3rem;
      padding: 2rem 0;
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      background: var(--color-surface);
      border-radius: 1rem;
      backdrop-filter: var(--backdrop-blur-sm);
      box-shadow: var(--shadow-sm);
    }

    .last-updated {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-family-sans);
    }

    .refresh-btn {
      background: var(--color-surface-elevated);
      border: 1px solid rgba(99, 102, 241, 0.2);
      color: var(--color-primary);
      border-radius: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-family: var(--font-family-sans);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-xs);
      transform: scale(1);
    }

    .refresh-btn:hover {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      box-shadow: var(--shadow-md);
      transform: scale(1.02);
    }

    .refresh-btn:active {
      transform: scale(0.98);
    }

    .refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Enhanced Mobile Responsiveness */
    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .header {
        margin-bottom: 2rem;
        padding: 1rem 0;
      }

      .title {
        font-size: var(--font-size-3xl);
      }

      .subtitle {
        font-size: var(--font-size-base);
      }

      .footer {
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
        padding: 1.5rem;
      }
    }

    @media (max-width: 640px) {
      :host {
        padding: 0.75rem;
      }

      .header {
        margin-bottom: 1.5rem;
      }

      .title {
        font-size: var(--font-size-2xl);
      }

      .subtitle {
        font-size: var(--font-size-sm);
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 0.5rem;
      }

      .header::before {
        width: 60px;
        height: 3px;
      }

      .title {
        font-size: var(--font-size-xl);
        margin: 0.75rem 0 0.25rem 0;
      }

      .subtitle {
        font-size: var(--font-size-sm);
      }

      .footer {
        padding: 1rem;
      }
    }
  `;

  static properties = {
    _isLoading: { state: true },
    _error: { state: true },
    _lastUpdated: { state: true },
  };

  constructor() {
    super();
    this._isLoading = false;
    this._error = null;
    this._lastUpdated = null;

    // Subscribe to store changes
    this._unsubscribe = currencyStore.subscribe((store) => {
      this._isLoading = store.isLoading;
      this._error = store.error;
      this._lastUpdated = store.lastUpdated;
    });
  }

  async connectedCallback() {
    super.connectedCallback();

    // Initialize the app
    try {
      await currencyAPI.initialize();
    } catch (error) {
      console.error("Failed to initialize app:", error);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  async _handleRefresh() {
    try {
      await currencyAPI.refreshRates();
    } catch (error) {
      console.error("Failed to refresh rates:", error);
    }
  }

  _formatLastUpdated() {
    if (!this._lastUpdated) return "Never";

    const date = new Date(this._lastUpdated);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  render() {
    return html`
      <div class="header">
        <div>
          <h1 class="title">💱 Currency Converter</h1>
          <p class="subtitle">Click any currency to start editing</p>
        </div>
      </div>

      ${this._error
        ? html`
            <div class="error"><strong>Error:</strong> ${this._error}</div>
          `
        : ""}
      ${this._isLoading
        ? html` <div class="loading">Loading exchange rates...</div> `
        : html` <currency-grid></currency-grid> `}

      <div class="footer">
        <div class="last-updated">
          🔄 Last updated: ${this._formatLastUpdated()}
        </div>
        <button
          class="refresh-btn"
          @click=${this._handleRefresh}
          ?disabled=${this._isLoading}
        >
          ${this._isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    `;
  }
}

customElements.define("currency-app", CurrencyApp);
