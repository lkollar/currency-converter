// Simple reactive store without decorators

class CurrencyStore {
  constructor() {
    // Exchange rates (USD as base)
    this.rates = {};

    // User's selected currencies
    this.userCurrencies = [];

    // Currently active currency for input
    this.activeCurrency = "USD";

    // Current amount in active currency
    this.activeAmount = 1000;

    // Last time rates were fetched
    this.lastUpdated = null;

    // Loading and error states
    this.isLoading = false;
    this.error = null;

    // Event listeners for reactive updates
    this.listeners = new Set();

    // Load persisted data
    this.loadFromStorage();
  }

  // Add listener for state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of state change
  notify() {
    this.listeners.forEach((listener) => listener(this));
  }

  // Set exchange rates
  setRates(rates) {
    this.rates = { ...rates };
    this.lastUpdated = Date.now();
    this.saveToStorage();
    this.notify();
  }

  // Set active currency (the one being edited)
  setActiveCurrency(currency, amount = null) {
    this.activeCurrency = currency.toUpperCase();
    if (amount !== null) {
      this.activeAmount = parseFloat(amount) || 0;
    }
    this.notify();
  }

  // Set amount for active currency
  setActiveAmount(amount) {
    this.activeAmount = parseFloat(amount) || 0;
    this.notify();
  }

  // Add currency to user's list
  addCurrency(currency) {
    const currencyCode = currency.toUpperCase();
    if (!this.userCurrencies.includes(currencyCode)) {
      this.userCurrencies.push(currencyCode);
      this.saveToStorage();
      this.notify();
    }
  }

  // Remove currency from user's list
  removeCurrency(currency) {
    const currencyCode = currency.toUpperCase();
    this.userCurrencies = this.userCurrencies.filter((c) => c !== currencyCode);

    // If removed currency was active, switch to first available
    if (
      this.activeCurrency === currencyCode &&
      this.userCurrencies.length > 0
    ) {
      this.activeCurrency = this.userCurrencies[0];
    }

    this.saveToStorage();
    this.notify();
  }

  // Reorder currencies in user's list
  reorderCurrencies(fromIndex, toIndex) {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.userCurrencies.length ||
      toIndex >= this.userCurrencies.length
    ) {
      return;
    }

    const newOrder = [...this.userCurrencies];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);

    this.userCurrencies = newOrder;
    this.saveToStorage();
    this.notify();
  }

  // Calculate amount in target currency
  convertAmount(fromCurrency, toCurrency, amount) {
    if (!this.rates || Object.keys(this.rates).length === 0) {
      // If rates aren't loaded yet, return the same amount as fallback
      // This prevents showing 0 for new currencies before rates load
      return amount;
    }

    const from = fromCurrency.toLowerCase();
    const to = toCurrency.toLowerCase();

    // Both currencies are USD
    if (from === "usd" && to === "usd") {
      return amount;
    }

    // From USD to other currency
    if (from === "usd") {
      return amount * (this.rates[to] || 0);
    }

    // From other currency to USD
    if (to === "usd") {
      return amount / (this.rates[from] || 1);
    }

    // Between two non-USD currencies (convert via USD)
    const usdAmount = amount / (this.rates[from] || 1);
    return usdAmount * (this.rates[to] || 0);
  }

  // Get all currency amounts based on active currency and amount
  getAllAmounts() {
    const amounts = {};

    for (const currency of this.userCurrencies) {
      if (currency === this.activeCurrency) {
        amounts[currency] = this.activeAmount;
      } else {
        amounts[currency] = this.convertAmount(
          this.activeCurrency,
          currency,
          this.activeAmount,
        );
      }
    }

    return amounts;
  }

  // Set loading state
  setLoading(isLoading) {
    this.isLoading = isLoading;
    this.notify();
  }

  // Set error state
  setError(error) {
    this.error = error;
    this.notify();
  }

  // Check if rates are stale (older than 24 hours)
  areRatesStale() {
    if (!this.lastUpdated) return true;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - this.lastUpdated > twentyFourHours;
  }

  // Save state to localStorage
  saveToStorage() {
    try {
      const state = {
        rates: this.rates,
        userCurrencies: this.userCurrencies,
        activeCurrency: this.activeCurrency,
        activeAmount: this.activeAmount,
        lastUpdated: this.lastUpdated,
      };
      localStorage.setItem("currency-store", JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }

  // Load state from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem("currency-store");
      if (stored) {
        const state = JSON.parse(stored);
        this.rates = state.rates || {};
        this.userCurrencies = state.userCurrencies || [];
        this.activeCurrency = state.activeCurrency || "USD";
        this.activeAmount = state.activeAmount || 1000;
        this.lastUpdated = state.lastUpdated || null;
      }
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
    }
  }
}

// Create singleton instance
export const currencyStore = new CurrencyStore();
