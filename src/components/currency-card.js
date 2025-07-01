import { LitElement, html, css } from "lit";
import { currencyStore } from "../store/currency-store.js";
import { currencyAPI } from "../services/currency-api.js";

export class CurrencyCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card:hover {
      border-color: #d1d5db;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .card.active {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .card.calculating {
      border-color: #f59e0b;
      opacity: 0.8;
    }

    .card.updated {
      border-color: #10b981;
      animation: pulse-green 0.5s ease;
    }

    @keyframes pulse-green {
      0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }

    .currency-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      cursor: pointer;
    }

    .currency-header:hover {
      opacity: 0.8;
    }

    .remove-button {
      background: none;
      border: none;
      color: #d1d5db;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: all 0.2s;
      opacity: 0.6;
      margin-left: auto;
    }

    .currency-header:hover .remove-button {
      opacity: 1;
      color: #9ca3af;
    }

    .remove-button:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .remove-button:disabled {
      cursor: not-allowed;
      opacity: 0.3;
    }

    .remove-button:disabled:hover {
      background: none;
      color: #9ca3af;
    }

    .currency-flag {
      font-size: 1.5rem;
      line-height: 1;
    }

    .currency-name {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      flex: 1;
    }

    .currency-code {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
    }

    .status-container {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .status-icon {
      font-size: 1rem;
      opacity: 0.7;
    }

    .amount {
      font-size: 1.875rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
      min-height: 2.5rem;
      display: flex;
      align-items: center;
    }

    .amount-input {
      font-size: 1.875rem;
      font-weight: 600;
      color: #1f2937;
      border: none;
      background: none;
      outline: none;
      width: 100%;
      padding: 0;
      margin: 0;
    }

    .amount-input:focus {
      color: #2563eb;
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
      padding: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .currency-option:hover,
    .currency-option.highlighted {
      background-color: #f3f4f6;
    }

    .currency-option-flag {
      font-size: 1rem;
    }

    .currency-option-details {
      flex: 1;
    }

    .currency-option-name {
      font-weight: 500;
      color: #1f2937;
    }

    .currency-option-code {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .hint {
      font-size: 0.75rem;
      color: #9ca3af;
      font-style: italic;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .card:hover .hint {
      opacity: 1;
    }

    @media (max-width: 640px) {
      .card {
        padding: 1rem;
        min-height: 100px;
      }

      .amount,
      .amount-input {
        font-size: 1.5rem;
      }

      .currency-name {
        font-size: 0.875rem;
      }

      .currency-code {
        font-size: 0.75rem;
      }
    }
  `;

  static properties = {
    currency: { type: String },
    _isActive: { state: true },
    _amount: { state: true },
    _isCalculating: { state: true },
    _isUpdated: { state: true },
    _showSelector: { state: true },
    _selectorFilter: { state: true },
    _highlightedIndex: { state: true },
    _canRemove: { state: true },
  };

  constructor() {
    super();
    this.currency = "USD";
    this._isActive = false;
    this._amount = 0;
    this._isCalculating = false;
    this._isUpdated = false;
    this._debounceTimer = null;
    this._showSelector = false;
    this._selectorFilter = '';
    this._highlightedIndex = -1;
    this._filteredCurrencies = [];
    this._canRemove = true;

    // Subscribe to store changes
    this._unsubscribe = currencyStore.subscribe((store) => {
      this._updateFromStore(store);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateFromStore(currencyStore);
    
    // Add global event listeners for dismissing selector
    this._handleGlobalClick = this._handleGlobalClick.bind(this);
    this._handleGlobalKeyDown = this._handleGlobalKeyDown.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    
    // Remove global event listeners
    this._removeGlobalListeners();
  }

  _updateFromStore(store) {
    const wasActive = this._isActive;
    this._isActive = store.activeCurrency === this.currency;

    // Update amount
    if (this._isActive) {
      this._amount = store.activeAmount;
    } else {
      const amounts = store.getAllAmounts();
      this._amount = amounts[this.currency] || 0;
    }

    // Check if this currency can be removed (not the last one)
    this._canRemove = store.userCurrencies.length > 1;

    // Show updated animation when amount changes and not active
    if (
      !this._isActive &&
      !wasActive &&
      this._amount !== this._previousAmount
    ) {
      this._showUpdatedAnimation();
    }
    this._previousAmount = this._amount;
  }

  _showUpdatedAnimation() {
    this._isUpdated = true;
    setTimeout(() => {
      this._isUpdated = false;
    }, 500);
  }

  _handleCardClick(e) {
    // Don't activate if clicking on currency header (for selector)
    if (e.target.closest('.currency-header')) {
      return;
    }
    
    if (!this._isActive) {
      currencyStore.setActiveCurrency(this.currency, this._amount);
      // Focus the input field after it's rendered
      this.updateComplete.then(() => {
        const input = this.shadowRoot.querySelector(".amount-input");
        if (input) {
          input.focus();
          input.select(); // Select all text for easy editing
        }
      });
    }
  }

  _handleCurrencyHeaderClick(e) {
    e.stopPropagation();
    const wasOpen = this._showSelector;
    this._showSelector = !this._showSelector;
    this._selectorFilter = '';
    this._highlightedIndex = -1;
    this._updateFilteredCurrencies();
    
    if (this._showSelector) {
      // Add global listeners when opening
      this._addGlobalListeners();
      
      this.updateComplete.then(() => {
        const input = this.shadowRoot.querySelector('.currency-selector input');
        if (input) {
          input.focus();
        }
      });
    } else if (wasOpen) {
      // Remove global listeners when closing
      this._removeGlobalListeners();
    }
  }

  _updateFilteredCurrencies() {
    // Focus on major currencies with proper flags
    const majorCurrencies = [
      'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'KRW',
      'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'BRL',
      'MXN', 'ZAR', 'NZD', 'TRY', 'AED', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
      'ILS', 'EGP', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP'
    ];
    
    const filter = this._selectorFilter.toLowerCase();
    const currentUserCurrencies = currencyStore.userCurrencies;
    
    this._filteredCurrencies = majorCurrencies
      .filter(code => {
        // Exclude currencies that are already selected
        if (currentUserCurrencies.includes(code)) return false;
        
        const name = currencyAPI.getCurrencyName(code).toLowerCase();
        return code.toLowerCase().includes(filter) || name.includes(filter);
      })
      .slice(0, 20); // Show more results - 20 instead of 10
  }

  _handleSelectorInput(e) {
    this._selectorFilter = e.target.value;
    this._highlightedIndex = -1;
    this._updateFilteredCurrencies();
  }

  _handleSelectorKeyDown(e) {
    if (e.key === 'Escape') {
      this._closeSelector();
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._highlightedIndex = Math.min(
        this._highlightedIndex + 1,
        this._filteredCurrencies.length - 1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._highlightedIndex = Math.max(this._highlightedIndex - 1, -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this._highlightedIndex >= 0) {
        this._selectCurrency(this._filteredCurrencies[this._highlightedIndex]);
      }
    }
  }

  _selectCurrency(newCurrency) {
    if (newCurrency !== this.currency) {
      const oldCurrency = this.currency;
      
      // Check if the new currency is already in the user's currency list
      if (currencyStore.userCurrencies.includes(newCurrency)) {
        // If new currency already exists, just remove the old one
        currencyStore.removeCurrency(oldCurrency);
      } else {
        // Replace the old currency with the new one in the store
        const index = currencyStore.userCurrencies.indexOf(oldCurrency);
        if (index >= 0) {
          currencyStore.userCurrencies[index] = newCurrency;
          currencyStore.saveToStorage();
          currencyStore.notify();
        } else {
          // If old currency isn't in store, just add the new one
          currencyStore.addCurrency(newCurrency);
        }
      }
      
      this.currency = newCurrency;
      this.dispatchEvent(new CustomEvent('currency-changed', {
        detail: { oldCurrency, newCurrency },
        bubbles: true
      }));
    }
    this._closeSelector();
  }

  _handleOptionClick(currency) {
    this._selectCurrency(currency);
  }

  _handleRemoveClick(e) {
    e.stopPropagation();
    if (this._canRemove) {
      currencyStore.removeCurrency(this.currency);
    }
  }

  _closeSelector() {
    this._showSelector = false;
    this._removeGlobalListeners();
  }

  _addGlobalListeners() {
    // Use setTimeout to avoid immediate triggering
    setTimeout(() => {
      document.addEventListener('click', this._handleGlobalClick);
      document.addEventListener('keydown', this._handleGlobalKeyDown);
    }, 0);
  }

  _removeGlobalListeners() {
    document.removeEventListener('click', this._handleGlobalClick);
    document.removeEventListener('keydown', this._handleGlobalKeyDown);
  }

  _handleGlobalClick(e) {
    // Close selector if click is outside this component
    if (!this.shadowRoot.contains(e.target) && !this.contains(e.target)) {
      this._closeSelector();
    }
  }

  _handleGlobalKeyDown(e) {
    if (e.key === 'Escape' && this._showSelector) {
      this._closeSelector();
    }
  }

  _handleInputChange(e) {
    const value = e.target.value;
    const numericValue = parseFloat(value) || 0;

    // Clear any existing debounce timer
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }

    // Update store after debounce delay
    this._debounceTimer = setTimeout(() => {
      currencyStore.setActiveAmount(numericValue);
    }, 300);
  }

  _handleInputKeyDown(e) {
    // Allow: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105) &&
      e.keyCode !== 190 &&
      e.keyCode !== 110
    ) {
      e.preventDefault();
    }
  }

  _formatAmount(amount) {
    if (amount === 0) return "0.00";

    // Format with appropriate decimal places
    if (amount >= 1) {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } else if (amount >= 0.01) {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(amount);
    } else {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(amount);
    }
  }

  _getStatusIcon() {
    if (this._isActive) return "✏️";
    if (this._isCalculating) return "⏳";
    if (this._isUpdated) return "✅";
    return "";
  }

  _getCurrencyName() {
    return currencyAPI.getCurrencyName(this.currency);
  }

  _getCurrencyFlag() {
    return currencyAPI.getCurrencyFlag(this.currency);
  }

  render() {
    const cardClasses = [
      "card",
      this._isActive && "active",
      this._isCalculating && "calculating",
      this._isUpdated && "updated",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class="${cardClasses}" @click=${this._handleCardClick}>
        <div class="currency-header" @click=${this._handleCurrencyHeaderClick}>
          <span class="currency-flag">${this._getCurrencyFlag()}</span>
          <span class="currency-name">${this._getCurrencyName()}</span>
          <span class="currency-code">${this.currency}</span>
          <button 
            class="remove-button" 
            ?disabled=${!this._canRemove}
            @click=${this._handleRemoveClick}
            title="Remove currency"
          >
            ×
          </button>
        </div>

        <div class="status-container">
          <span class="status-icon">${this._getStatusIcon()}</span>
        </div>

        <div class="amount">
          ${this._isActive
            ? html`
                <input
                  class="amount-input"
                  type="text"
                  .value=${this._amount.toString()}
                  @input=${this._handleInputChange}
                  @keydown=${this._handleInputKeyDown}
                  @click=${(e) => e.stopPropagation()}
                  placeholder="0.00"
                />
              `
            : html` ${this._formatAmount(this._amount)} `}
        </div>

        ${this._showSelector ? html`
          <div class="currency-selector" @click=${(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Search currencies..."
              .value=${this._selectorFilter}
              @input=${this._handleSelectorInput}
              @keydown=${this._handleSelectorKeyDown}
            />
            ${this._filteredCurrencies.map((code, index) => html`
              <div
                class="currency-option ${index === this._highlightedIndex ? 'highlighted' : ''}"
                @click=${() => this._handleOptionClick(code)}
              >
                <span class="currency-option-flag">${currencyAPI.getCurrencyFlag(code)}</span>
                <div class="currency-option-details">
                  <div class="currency-option-name">${currencyAPI.getCurrencyName(code)}</div>
                  <div class="currency-option-code">${code}</div>
                </div>
              </div>
            `)}
          </div>
        ` : ''}

        ${!this._isActive
          ? html` <div class="hint">Click to start editing</div> `
          : ""}
      </div>
    `;
  }
}

customElements.define("currency-card", CurrencyCard);
