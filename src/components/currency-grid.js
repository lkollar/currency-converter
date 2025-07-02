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
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      animation: fadeIn 0.6s ease-out;
    }

    .currency-card-wrapper {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: grab;
      will-change: transform;
    }

    .currency-card-wrapper:active {
      cursor: grabbing;
    }

    .currency-card-wrapper.dragging {
      transform: rotate(3deg) scale(1.05);
      box-shadow: var(--shadow-2xl);
      z-index: 1000;
      backdrop-filter: var(--backdrop-blur);
    }

    .currency-card-wrapper.drop-target {
      transform: scale(1.02);
      box-shadow: var(--shadow-xl), var(--shadow-glow-primary);
    }

    .add-currency {
      background: rgba(240, 253, 244, 0.7);
      backdrop-filter: var(--backdrop-blur-sm);
      border: 2px dashed rgba(5, 150, 105, 0.3);
      border-radius: 1rem;
      padding: 2rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      box-shadow: var(--shadow-xs);
      transform: scale(1);
    }

    .add-currency:hover {
      border-color: var(--color-primary);
      background: rgba(220, 252, 231, 0.8);
      box-shadow: var(--shadow-md);
      transform: scale(1.02);
    }

    .add-currency-icon {
      font-size: var(--font-size-4xl);
      margin-bottom: 0.75rem;
      opacity: 0.6;
      background: var(--color-primary-gradient);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: all 0.3s ease;
    }

    .add-currency:hover .add-currency-icon {
      opacity: 1;
      transform: scale(1.1);
    }

    .add-currency-text {
      font-family: var(--font-family-display);
      font-size: var(--font-size-lg);
      color: var(--color-gray-700);
      font-weight: var(--font-weight-medium);
      line-height: var(--line-height-snug);
    }

    .add-currency-picker {
      position: relative;
    }

    .currency-selector {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      max-height: 320px;
      overflow-y: auto;
      z-index: 1000;
      margin-top: 0.25rem;
    }

    .currency-selector input {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-bottom: 1px solid #e5e7eb;
      outline: none;
      font-size: 0.875rem;
    }

    .currency-option {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      cursor: pointer;
      transition: background-color 0.15s;
      border-bottom: 1px solid #f3f4f6;
    }

    .currency-option:hover {
      background-color: #f9fafb;
    }

    .currency-option:last-child {
      border-bottom: none;
    }

    .currency-option-flag {
      margin-right: 0.75rem;
      font-size: 1.25rem;
    }

    .currency-option-info {
      flex: 1;
    }

    .currency-option-name {
      font-weight: 500;
      color: #111827;
      margin-bottom: 0.125rem;
    }

    .currency-option-code {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-gray-600);
      font-family: var(--font-family-sans);
    }

    /* Enhanced Mobile Responsiveness */
    @media (max-width: 768px) {
      .grid {
        gap: 1.25rem;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
    }

    @media (max-width: 640px) {
      .grid {
        gap: 1rem;
        grid-template-columns: 1fr;
      }

      .add-currency {
        padding: 1.5rem;
        min-height: 100px;
      }

      .add-currency-icon {
        font-size: var(--font-size-3xl);
        margin-bottom: 0.5rem;
      }

      .add-currency-text {
        font-size: var(--font-size-base);
      }
    }

    @media (max-width: 480px) {
      .grid {
        gap: 0.75rem;
      }

      .add-currency {
        padding: 1.25rem;
        min-height: 90px;
      }
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
    _draggedIndex: { state: true },
    _dropTargetIndex: { state: true },
    _showAddCurrencyPicker: { state: true },
    _addCurrencyFilter: { state: true },
    _filteredAddCurrencies: { state: true },
  };

  constructor() {
    super();
    this._userCurrencies = [];
    this._rates = {};
    this._draggedIndex = -1;
    this._dropTargetIndex = -1;
    this._showAddCurrencyPicker = false;
    this._addCurrencyFilter = "";
    this._filteredAddCurrencies = [];

    // Subscribe to store changes
    this._unsubscribe = currencyStore.subscribe((store) => {
      this._userCurrencies = [...store.userCurrencies];
      this._rates = { ...store.rates };
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateFromStore();

    // Add global click listener for closing picker
    this._handleGlobalClick = this._handleGlobalClick.bind(this);
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
    this._showAddCurrencyPicker = true;
    this._addCurrencyFilter = "";
    this._updateFilteredAddCurrencies();

    // Add global click listener when picker opens
    setTimeout(() => {
      document.addEventListener("click", this._handleGlobalClick);
    }, 0);
  }

  _updateFilteredAddCurrencies() {
    // Major currencies with proper ordering
    const majorCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "CAD",
      "AUD",
      "CHF",
      "CNY",
      "INR",
      "KRW",
      "SGD",
      "HKD",
      "NOK",
      "SEK",
      "DKK",
      "PLN",
      "CZK",
      "HUF",
      "RUB",
      "BRL",
      "MXN",
      "ZAR",
      "NZD",
      "TRY",
      "AED",
      "THB",
      "MYR",
      "IDR",
      "PHP",
      "VND",
      "TWD",
      "ILS",
      "CLP",
      "COP",
      "PEN",
      "ARS",
      "UYU",
      "ISK",
      "HRK",
      "BGN",
      "RON",
      "UAH",
      "KZT",
      "EGP",
      "MAD",
      "TND",
      "KES",
      "GHS",
      "NGN",
      "ETB",
    ];

    // Filter out currencies already in use
    const availableCurrencies = majorCurrencies.filter(
      (currency) => !this._userCurrencies.includes(currency),
    );

    // Apply search filter
    const filter = this._addCurrencyFilter.toLowerCase();
    this._filteredAddCurrencies = availableCurrencies.filter((currency) => {
      const currencyCode = currency.toLowerCase();
      const currencyName = this._getCurrencyName(currency).toLowerCase();
      return currencyCode.includes(filter) || currencyName.includes(filter);
    });
  }

  _selectAddCurrency(currency) {
    currencyStore.addCurrency(currency);
    this._closeAddCurrencyPicker();
  }

  _handleAddCurrencyFilter(e) {
    this._addCurrencyFilter = e.target.value;
    this._updateFilteredAddCurrencies();
  }

  _closeAddCurrencyPicker() {
    this._showAddCurrencyPicker = false;
    this._addCurrencyFilter = "";

    // Remove global click listener
    document.removeEventListener("click", this._handleGlobalClick);
  }

  _handleGlobalClick(e) {
    // Close picker if clicking outside
    if (!this.contains(e.target)) {
      this._closeAddCurrencyPicker();
    }
  }

  _getCurrencyName(currency) {
    const names = {
      USD: "US Dollar",
      EUR: "Euro",
      GBP: "British Pound",
      JPY: "Japanese Yen",
      CAD: "Canadian Dollar",
      AUD: "Australian Dollar",
      CHF: "Swiss Franc",
      CNY: "Chinese Yuan",
      INR: "Indian Rupee",
      KRW: "South Korean Won",
      SGD: "Singapore Dollar",
      HKD: "Hong Kong Dollar",
      NOK: "Norwegian Krone",
      SEK: "Swedish Krona",
      DKK: "Danish Krone",
      PLN: "Polish Zloty",
      CZK: "Czech Koruna",
      HUF: "Hungarian Forint",
      RUB: "Russian Ruble",
      BRL: "Brazilian Real",
      MXN: "Mexican Peso",
      ZAR: "South African Rand",
      NZD: "New Zealand Dollar",
      TRY: "Turkish Lira",
      AED: "UAE Dirham",
      THB: "Thai Baht",
      MYR: "Malaysian Ringgit",
      IDR: "Indonesian Rupiah",
      PHP: "Philippine Peso",
      VND: "Vietnamese Dong",
      TWD: "Taiwan Dollar",
      ILS: "Israeli Shekel",
      CLP: "Chilean Peso",
      COP: "Colombian Peso",
      PEN: "Peruvian Sol",
      ARS: "Argentine Peso",
      UYU: "Uruguayan Peso",
      ISK: "Icelandic Krona",
      HRK: "Croatian Kuna",
      BGN: "Bulgarian Lev",
      RON: "Romanian Leu",
      UAH: "Ukrainian Hryvnia",
      KZT: "Kazakhstani Tenge",
      EGP: "Egyptian Pound",
      MAD: "Moroccan Dirham",
      TND: "Tunisian Dinar",
      KES: "Kenyan Shilling",
      GHS: "Ghanaian Cedi",
      NGN: "Nigerian Naira",
      ETB: "Ethiopian Birr",
    };
    return names[currency] || currency;
  }

  _getCurrencyFlag(currency) {
    const flags = {
      USD: "🇺🇸",
      EUR: "🇪🇺",
      GBP: "🇬🇧",
      JPY: "🇯🇵",
      CAD: "🇨🇦",
      AUD: "🇦🇺",
      CHF: "🇨🇭",
      CNY: "🇨🇳",
      INR: "🇮🇳",
      KRW: "🇰🇷",
      SGD: "🇸🇬",
      HKD: "🇭🇰",
      NOK: "🇳🇴",
      SEK: "🇸🇪",
      DKK: "🇩🇰",
      PLN: "🇵🇱",
      CZK: "🇨🇿",
      HUF: "🇭🇺",
      RUB: "🇷🇺",
      BRL: "🇧🇷",
      MXN: "🇲🇽",
      ZAR: "🇿🇦",
      NZD: "🇳🇿",
      TRY: "🇹🇷",
      AED: "🇦🇪",
      THB: "🇹🇭",
      MYR: "🇲🇾",
      IDR: "🇮🇩",
      PHP: "🇵🇭",
      VND: "🇻🇳",
      TWD: "🇹🇼",
      ILS: "🇮🇱",
      CLP: "🇨🇱",
      COP: "🇨🇴",
      PEN: "🇵🇪",
      ARS: "🇦🇷",
    };
    return flags[currency] || "🏳️";
  }

  _handleCurrencyChanged(e) {
    // Handle currency change events from currency cards
    // The currency card has already updated the store, so we just need to refresh
    this._updateFromStore();
  }

  _handleDragStart(e) {
    this._draggedIndex = parseInt(e.target.dataset.index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
  }

  _handleDragEnd(e) {
    e.target.style.opacity = "1";
    this._draggedIndex = -1;
    this._dropTargetIndex = -1;
  }

  _handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const targetIndex = parseInt(e.currentTarget.dataset.index);
    this._dropTargetIndex = targetIndex;
  }

  _handleDragLeave(e) {
    // Only clear drop target if we're actually leaving the element
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this._dropTargetIndex = -1;
    }
  }

  _handleDrop(e) {
    e.preventDefault();
    const targetIndex = parseInt(e.currentTarget.dataset.index);

    if (this._draggedIndex !== -1 && this._draggedIndex !== targetIndex) {
      currencyStore.reorderCurrencies(this._draggedIndex, targetIndex);
    }

    this._draggedIndex = -1;
    this._dropTargetIndex = -1;
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
          (currency, index) => html`
            <div
              class="currency-card-wrapper ${this._draggedIndex === index
                ? "dragging"
                : ""} ${this._dropTargetIndex === index ? "drop-target" : ""}"
              draggable="true"
              data-index="${index}"
              @dragstart=${this._handleDragStart}
              @dragend=${this._handleDragEnd}
              @dragover=${this._handleDragOver}
              @dragleave=${this._handleDragLeave}
              @drop=${this._handleDrop}
            >
              <currency-card
                currency=${currency}
                @currency-changed=${this._handleCurrencyChanged}
              ></currency-card>
            </div>
          `,
        )}

        <div class="add-currency-picker">
          <div class="add-currency" @click=${this._handleAddCurrency}>
            <div class="add-currency-icon">+</div>
            <div class="add-currency-text">Add Currency</div>
          </div>

          ${this._showAddCurrencyPicker
            ? html`
                <div class="currency-selector">
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    .value=${this._addCurrencyFilter}
                    @input=${this._handleAddCurrencyFilter}
                    @click=${(e) => e.stopPropagation()}
                  />
                  <div class="currency-options">
                    ${this._filteredAddCurrencies.map(
                      (currency) => html`
                        <div
                          class="currency-option"
                          @click=${() => this._selectAddCurrency(currency)}
                        >
                          <div class="currency-option-flag">
                            ${this._getCurrencyFlag(currency)}
                          </div>
                          <div class="currency-option-info">
                            <div class="currency-option-name">
                              ${this._getCurrencyName(currency)}
                            </div>
                            <div class="currency-option-code">${currency}</div>
                          </div>
                        </div>
                      `,
                    )}
                  </div>
                </div>
              `
            : ""}
        </div>
      </div>
    `;
  }
}

customElements.define("currency-grid", CurrencyGrid);
