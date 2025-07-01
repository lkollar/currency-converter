import { LitElement, html, css } from "lit";
import { currencyStore } from "../store/currency-store.js";
import "./currency-card.js";

export class CurrencyGrid extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .add-currency {
      background: #f8fafc;
      border: 2px dashed #d1d5db;
      border-radius: 0.75rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .add-currency:hover {
      border-color: #2563eb;
      background-color: #f0f9ff;
    }

    .add-currency-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .add-currency-text {
      font-size: 1rem;
      color: #6b7280;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6b7280;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .empty-state p {
      margin-bottom: 1.5rem;
    }

    .setup-btn {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .setup-btn:hover {
      background-color: #1d4ed8;
    }

    @media (max-width: 640px) {
      .grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .add-currency {
        min-height: 100px;
        padding: 1rem;
      }

      .add-currency-icon {
        font-size: 1.5rem;
      }

      .add-currency-text {
        font-size: 0.875rem;
      }
    }

    @media (min-width: 641px) and (max-width: 1024px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1025px) {
      .grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `;

  static properties = {
    _userCurrencies: { state: true },
    _rates: { state: true },
  };

  constructor() {
    super();
    this._userCurrencies = [];
    this._rates = {};

    // Subscribe to store changes
    this._unsubscribe = currencyStore.subscribe((store) => {
      this._userCurrencies = [...store.userCurrencies];
      this._rates = { ...store.rates };
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateFromStore();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  _updateFromStore() {
    this._userCurrencies = [...currencyStore.userCurrencies];
    this._rates = { ...currencyStore.rates };
  }

  _handleAddCurrency() {
    // Add the first available major currency that's not already selected
    const majorCurrencies = [
      'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'KRW', 'SGD', 'HKD',
      'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'BRL', 'MXN',
      'ZAR', 'NZD', 'TRY', 'AED', 'THB', 'MYR', 'IDR', 'PHP'
    ];

    for (const currency of majorCurrencies) {
      if (!this._userCurrencies.includes(currency)) {
        currencyStore.addCurrency(currency);
        break;
      }
    }
  }

  _handleCurrencyChanged(e) {
    // Handle currency change events from currency cards
    // The currency card has already updated the store, so we just need to refresh
    this._updateFromStore();
  }

  _handleSetupDefaults() {
    // Add default currencies
    const defaultCurrencies = ["USD", "EUR", "GBP", "JPY"];

    defaultCurrencies.forEach((currency) => {
      currencyStore.addCurrency(currency);
    });
  }

  render() {
    // Show empty state if no currencies are selected
    if (this._userCurrencies.length === 0) {
      return html`
        <div class="empty-state">
          <h3>No currencies selected</h3>
          <p>Add some currencies to start converting between them.</p>
          <button class="setup-btn" @click=${this._handleSetupDefaults}>
            Add Popular Currencies
          </button>
        </div>
      `;
    }

    // Show message if no exchange rates are available
    if (Object.keys(this._rates).length === 0) {
      return html`
        <div class="empty-state">
          <h3>Loading exchange rates...</h3>
          <p>Please wait while we fetch the latest currency data.</p>
        </div>
      `;
    }

    return html`
      <div class="grid">
        ${this._userCurrencies.map(
          (currency) => html`
            <currency-card 
              currency=${currency}
              @currency-changed=${this._handleCurrencyChanged}
            ></currency-card>
          `,
        )}

        <div class="add-currency" @click=${this._handleAddCurrency}>
          <div class="add-currency-icon">+</div>
          <div class="add-currency-text">Add Currency</div>
        </div>
      </div>
    `;
  }
}

customElements.define("currency-grid", CurrencyGrid);
