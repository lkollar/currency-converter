import { LitElement, html, css } from "lit";
import { currencyStore } from "../store/currency-store.js";
import { currencyAPI } from "../services/currency-api.js";
import "./currency-grid.js";

export class CurrencyApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
      background-color: #f8fafc;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem 0;
    }

    .title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0.25rem 0 0 0;
    }

    .settings-btn {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .settings-btn:hover {
      background-color: #1d4ed8;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      color: #6b7280;
    }

    .error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding: 1rem 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .last-updated {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .refresh-btn {
      background: none;
      border: 1px solid #d1d5db;
      color: #6b7280;
      border-radius: 0.375rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .refresh-btn:hover {
      background-color: #f3f4f6;
      border-color: #9ca3af;
    }

    .refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      :host {
        padding: 0.5rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .title {
        font-size: 1.5rem;
      }

      .footer {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
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

  _handleSettings() {
    // TODO: Implement settings panel
    console.log("Settings clicked");
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
        <button class="settings-btn" @click=${this._handleSettings}>
          ⚙️ Settings
        </button>
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
