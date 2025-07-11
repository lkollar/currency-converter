import { LitElement, html, css } from "lit";
import { currencyStore } from "../store/currency-store.js";
import { currencyAPI } from "../services/currency-api.js";

export class CurrencyCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--color-surface);
      backdrop-filter: var(--backdrop-blur-sm);
      border: 1px solid rgba(229, 231, 235, 0.3);
      border-radius: 1rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-sm);
      transform: translateY(0);
      z-index: 1;
    }

    .card:hover {
      background: var(--color-surface-elevated);
      border-color: rgba(99, 102, 241, 0.2);
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .card.active {
      background: var(--color-surface-active);
      border-color: var(--color-primary);
      box-shadow: var(--shadow-lg), var(--shadow-glow-primary);
      transform: translateY(-1px);
      z-index: 2;
    }

    .card.selector-open {
      z-index: 3;
    }

    .card.calculating {
      background: rgba(245, 158, 11, 0.05);
      border-color: var(--color-warning);
      box-shadow: var(--shadow-md), var(--shadow-glow-warning);
      opacity: 0.9;
    }

    .card.updated {
      background: rgba(16, 185, 129, 0.05);
      border-color: var(--color-success);
      box-shadow: var(--shadow-md), var(--shadow-glow-success);
      animation: pulse-green 0.6s ease;
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
      font-family: var(--font-family-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-800);
      flex: 1;
      line-height: var(--line-height-snug);
    }

    .currency-code {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-gray-600);
      background: var(--color-gray-100);
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      letter-spacing: 0.5px;
      text-transform: uppercase;
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
      font-family: var(--font-family-mono);
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-gray-900);
      margin-bottom: 0.5rem;
      min-height: 2.5rem;
      display: flex;
      align-items: center;
      line-height: var(--line-height-tight);
      letter-spacing: -0.025em;
    }

    .amount-input {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-gray-900);
      border: none;
      background: none;
      outline: none;
      width: 100%;
      padding: 0;
      margin: 0;
      line-height: var(--line-height-tight);
      letter-spacing: -0.025em;
    }

    .amount-input:focus {
      color: var(--color-primary);
    }

    .amount-input.unsaved {
      color: var(--color-warning);
      background: rgba(245, 158, 11, 0.08);
      border-radius: 0.5rem;
      padding: 0.25rem 0.5rem;
    }

    .submit-button {
      margin-left: 0.75rem;
      padding: 0.375rem 0.75rem;
      background: var(--color-primary-gradient);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-family: var(--font-family-sans);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);
      transform: scale(1);
    }

    .submit-button:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }

    .submit-button:active {
      transform: scale(0.98);
    }

    .submit-button:disabled {
      background: var(--color-gray-300);
      cursor: not-allowed;
      transform: scale(1);
      box-shadow: none;
    }

    .currency-selector {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--color-surface-elevated);
      backdrop-filter: var(--backdrop-blur);
      border: 1px solid rgba(229, 231, 235, 0.2);
      border-radius: 0.75rem;
      box-shadow: var(--shadow-xl);
      max-height: 320px;
      overflow-y: auto;
      z-index: 10;
      margin-top: 0.5rem;
      animation: slideIn 0.2s ease-out;
    }

    .currency-selector input {
      width: 100%;
      padding: 1rem;
      border: none;
      border-bottom: 1px solid rgba(229, 231, 235, 0.3);
      outline: none;
      font-family: var(--font-family-sans);
      font-size: var(--font-size-sm);
      background: transparent;
      color: var(--color-gray-800);
      border-radius: 0.75rem 0.75rem 0 0;
    }

    .currency-selector input::placeholder {
      color: var(--color-gray-500);
    }

    .currency-selector input:focus {
      border-bottom-color: var(--color-primary);
    }

    .currency-option {
      padding: 0.875rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 0.5rem;
      margin: 0 0.25rem;
    }

    .currency-option:hover,
    .currency-option.highlighted {
      background: var(--color-surface-hover);
      transform: translateX(4px);
    }

    .currency-option:last-child {
      border-radius: 0 0 0.75rem 0.75rem;
    }

    .currency-option-flag {
      font-size: var(--font-size-lg);
      line-height: 1;
    }

    .currency-option-details {
      flex: 1;
    }

    .currency-option-name {
      font-family: var(--font-family-display);
      font-weight: var(--font-weight-medium);
      color: var(--color-gray-800);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-snug);
    }

    .currency-option-code {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-gray-600);
      letter-spacing: 0.5px;
      margin-top: 0.125rem;
    }

    .hint {
      font-family: var(--font-family-sans);
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
      font-style: italic;
      opacity: 0;
      transition: all 0.3s ease;
      transform: translateY(2px);
    }

    .card:hover .hint {
      opacity: 1;
      transform: translateY(0);
    }

    /* Enhanced Mobile Responsiveness */
    @media (max-width: 640px) {
      .card {
        padding: 1.25rem;
        min-height: 110px;
        border-radius: 0.875rem;
      }

      .amount,
      .amount-input {
        font-size: var(--font-size-2xl);
      }

      .currency-name {
        font-size: var(--font-size-base);
      }

      .currency-code {
        font-size: var(--font-size-xs);
        padding: 0.25rem 0.5rem;
      }

      .currency-selector {
        max-height: 280px;
      }

      .currency-option {
        padding: 1rem;
      }

      .hint {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .card {
        padding: 1rem;
        min-height: 100px;
      }

      .amount,
      .amount-input {
        font-size: var(--font-size-xl);
      }

      .currency-name {
        font-size: var(--font-size-sm);
      }
    }
  `;

  static properties = {
    currency: { type: String },
    _isActive: { state: true },
    _amount: { state: true },
    _inputValue: { state: true },
    _hasUnsavedChanges: { state: true },
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
    this._inputValue = "";
    this._hasUnsavedChanges = false;
    this._isCalculating = false;
    this._isUpdated = false;
    this._showSelector = false;
    this._selectorFilter = "";
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
    this._handleCloseOtherDropdowns =
      this._handleCloseOtherDropdowns.bind(this);

    // Listen for close-other-dropdowns events
    document.addEventListener(
      "close-other-dropdowns",
      this._handleCloseOtherDropdowns,
    );
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    // Update from store when currency property changes
    if (changedProperties.has("currency")) {
      this._updateFromStore(currencyStore);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }

    // Remove global event listeners
    this._removeGlobalListeners();
    document.removeEventListener(
      "close-other-dropdowns",
      this._handleCloseOtherDropdowns,
    );
  }

  _updateFromStore(store) {
    const wasActive = this._isActive;
    this._isActive = store.activeCurrency === this.currency;

    // Update amount
    if (this._isActive) {
      this._amount = store.activeAmount;
      // Update input value when becoming active or amount changes from external source
      if (!wasActive || !this._hasUnsavedChanges) {
        this._inputValue = this._amount.toFixed(2);
        this._hasUnsavedChanges = false;
      }
    } else {
      const amounts = store.getAllAmounts();
      this._amount = amounts[this.currency] || 0;
      // Clear any unsaved changes when becoming inactive
      this._hasUnsavedChanges = false;
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
    if (e.target.closest(".currency-header")) {
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

    // Close all other dropdowns first
    this._closeAllOtherDropdowns();

    this._showSelector = !this._showSelector;
    this._selectorFilter = "";
    this._highlightedIndex = -1;
    this._updateFilteredCurrencies();

    if (this._showSelector) {
      // Add global listeners when opening
      this._addGlobalListeners();

      this.updateComplete.then(() => {
        const input = this.shadowRoot.querySelector(".currency-selector input");
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
    const majorCurrencies = currencyAPI.getMajorCurrencies();

    const filter = this._selectorFilter.toLowerCase();
    const currentUserCurrencies = currencyStore.userCurrencies;

    this._filteredCurrencies = majorCurrencies
      .filter((code) => {
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
    if (e.key === "Escape") {
      this._closeSelector();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this._highlightedIndex = Math.min(
        this._highlightedIndex + 1,
        this._filteredCurrencies.length - 1,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._highlightedIndex = Math.max(this._highlightedIndex - 1, -1);
    } else if (e.key === "Enter") {
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
      this.dispatchEvent(
        new CustomEvent("currency-changed", {
          detail: { oldCurrency, newCurrency },
          bubbles: true,
        }),
      );
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

  _closeAllOtherDropdowns() {
    // Dispatch a custom event to close all other dropdowns
    this.dispatchEvent(
      new CustomEvent("close-other-dropdowns", {
        detail: { except: this },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleCloseOtherDropdowns(e) {
    // Close this dropdown if it's not the one that triggered the event
    if (e.detail.except !== this && this._showSelector) {
      this._closeSelector();
    }
  }

  _addGlobalListeners() {
    // Use setTimeout to avoid immediate triggering
    setTimeout(() => {
      document.addEventListener("click", this._handleGlobalClick);
      document.addEventListener("keydown", this._handleGlobalKeyDown);
    }, 0);
  }

  _removeGlobalListeners() {
    document.removeEventListener("click", this._handleGlobalClick);
    document.removeEventListener("keydown", this._handleGlobalKeyDown);
  }

  _handleGlobalClick(e) {
    // Close selector if click is outside this component
    if (!this.shadowRoot.contains(e.target) && !this.contains(e.target)) {
      this._closeSelector();
    }
  }

  _handleGlobalKeyDown(e) {
    if (e.key === "Escape" && this._showSelector) {
      this._closeSelector();
    }
  }

  _handleInputChange(e) {
    const value = e.target.value;
    this._inputValue = value;

    // Check if value has changed from stored amount
    const numericValue = parseFloat(value) || 0;
    this._hasUnsavedChanges = numericValue !== this._amount;
  }

  _submitValue() {
    if (this._hasUnsavedChanges) {
      const numericValue = parseFloat(this._inputValue) || 0;
      currencyStore.setActiveAmount(numericValue);
      this._hasUnsavedChanges = false;
    }
  }

  _handleInputBlur() {
    this._submitValue();
  }

  _handleSubmitClick(e) {
    e.stopPropagation();
    this._submitValue();
  }

  _handleInputKeyDown(e) {
    // Submit on Enter key
    if (e.key === "Enter") {
      e.preventDefault();
      this._submitValue();
      e.target.blur(); // Remove focus after submit
      return;
    }

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
      this._showSelector && "selector-open",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div
        class="${cardClasses}"
        role="button"
        tabindex="0"
        @click=${this._handleCardClick}
        @keydown=${(e) => {
          if (e.key === 'Enter' || e.key === ' ') this._handleCardClick(e);
        }}
        aria-label="Activate ${this.currency} currency card"
      >
        <div
          class="currency-header"
          @click=${this._handleCurrencyHeaderClick}
          @keydown=${(e) => {
            if (e.key === 'Enter' || e.key === ' ')
              this._handleCurrencyHeaderClick(e);
          }}
          role="button"
          tabindex="0"
          aria-haspopup="listbox"
          aria-expanded="${this._showSelector}"
          aria-label="Change currency for this card"
        >
          <span class="currency-name"
            >${this._getCurrencyFlag()} ${this._getCurrencyName()}</span
          >
          <span class="currency-code">${this.currency}</span>
          <button
            class="remove-button"
            ?disabled=${!this._canRemove}
            @click=${this._handleRemoveClick}
            title="Remove currency"
            aria-label="Remove ${this.currency} currency"
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
                  class="amount-input ${this._hasUnsavedChanges
                    ? "unsaved"
                    : ""}"
                  type="text"
                  .value=${this._inputValue}
                  @input=${this._handleInputChange}
                  @keydown=${this._handleInputKeyDown}
                  @blur=${this._handleInputBlur}
                  @click=${(e) => e.stopPropagation()}
                  placeholder="0.00"
                  inputmode="decimal"
                  aria-label="Amount in ${this.currency}"
                />
                ${this._hasUnsavedChanges
                  ? html`
                      <button
                        class="submit-button"
                        @click=${this._handleSubmitClick}
                        title="Submit value (or press Enter)"
                        aria-label="Submit amount"
                      >
                        ✓
                      </button>
                    `
                  : ""}
              `
            : html` ${this._formatAmount(this._amount)} `}
        </div>

        ${this._showSelector
          ? html`
              <div
                class="currency-selector"
                @click=${(e) => e.stopPropagation()}
                role="listbox"
                aria-label="Currency selection"
              >
                <input
                    type="text"
                    placeholder="Search currencies..."
                    .value=${this._selectorFilter}
                    @input=${this._handleSelectorInput}
                    @keydown=${this._handleSelectorKeyDown}
                    role="searchbox"
                    aria-label="Search currencies"
                  />
                ${this._filteredCurrencies.map(
                  (code, index) => html`
                    <div
                      class="currency-option ${index === this._highlightedIndex
                        ? "highlighted"
                        : ""}"
                      @click=${() => this._handleOptionClick(code)}
                      role="option"
                      aria-selected="${index === this._highlightedIndex}"
                      tabindex="0"
                      @keydown=${(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          this._handleOptionClick(code);
                      }}
                    >
                      <span class="currency-option-flag"
                        >${currencyAPI.getCurrencyFlag(code)}</span
                      >
                      <div class="currency-option-details">
                        <div class="currency-option-name">
                          ${currencyAPI.getCurrencyName(code)}
                        </div>
                        <div class="currency-option-code">${code}</div>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `
          : ""}
        ${!this._isActive
          ? html` <div class="hint">Click to start editing</div> `
          : ""}
      </div>
    `;
  }
}

customElements.define("currency-card", CurrencyCard);
