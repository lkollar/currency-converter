import { currencyStore } from "../store/currency-store.js";
import { currencyData, majorCurrencies } from "../utils/currency-data.js";

class CurrencyAPI {
  constructor() {
    this.baseUrl =
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";
    this.baseCurrency = "usd";
  }

  // Fetch exchange rates from API
  async fetchRates() {
    try {
      currencyStore.setLoading(true);
      currencyStore.setError(null);

      const response = await fetch(`${this.baseUrl}/${this.baseCurrency}.json`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API returns { date: "2024-xx-xx", usd: { eur: 0.92, gbp: 0.79, ... } }
      const rates = data[this.baseCurrency];

      if (!rates) {
        throw new Error("Invalid API response format");
      }

      // Add USD rate (1.0) for base currency
      const allRates = { usd: 1, ...rates };

      currencyStore.setRates(allRates);
      return allRates;
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      currencyStore.setError(error.message);
      throw error;
    } finally {
      currencyStore.setLoading(false);
    }
  }

  // Get rates with smart caching
  async getRates() {
    // Return cached rates if they're fresh
    if (
      !currencyStore.areRatesStale() &&
      Object.keys(currencyStore.rates).length > 0
    ) {
      return currencyStore.rates;
    }

    // Fetch fresh rates
    return await this.fetchRates();
  }

  // Initialize rates on app load
  async initialize() {
    try {
      // If we have cached rates that aren't stale, use them
      if (
        !currencyStore.areRatesStale() &&
        Object.keys(currencyStore.rates).length > 0
      ) {
        return currencyStore.rates;
      }

      // Otherwise fetch fresh rates
      return await this.fetchRates();
    } catch (error) {
      // If fetch fails but we have cached rates, use them with a warning
      if (Object.keys(currencyStore.rates).length > 0) {
        console.warn("Using cached rates due to API error:", error);
        return currencyStore.rates;
      }
      throw error;
    }
  }

  // Refresh rates manually
  async refreshRates() {
    return await this.fetchRates();
  }

  // Get list of available currencies
  getAvailableCurrencies() {
    const rates = currencyStore.rates;
    return Object.keys(rates)
      .map((code) => code.toUpperCase())
      .sort();
  }

  // Get list of major currencies
  getMajorCurrencies() {
    return majorCurrencies;
  }

  // Check if currency is supported
  isCurrencySupported(currency) {
    const code = currency.toLowerCase();
    return code in currencyStore.rates;
  }

  // Get currency name/description (basic mapping)
  getCurrencyName(currency) {
    const code = currency.toUpperCase();
    return currencyData[code]?.name || code;
  }

  // Get currency flag emoji
  getCurrencyFlag(currency) {
    const code = currency.toUpperCase();
    return currencyData[code]?.flag || "🏳️";
  }
}

// Create singleton instance
export const currencyAPI = new CurrencyAPI();
