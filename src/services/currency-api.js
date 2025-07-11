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
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      const rates = data[this.baseCurrency];

      if (!rates) {
        throw new Error("Invalid API response format");
      }

      const allRates = { usd: 1, ...rates };
      currencyStore.setRates(allRates);
      return allRates;
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      const errorMessage = "Could not fetch new rates. Displaying last saved data.";
      currencyStore.setError(errorMessage);

      // Only throw if there are no rates at all
      if (Object.keys(currencyStore.rates).length === 0) {
        throw new Error("API fetch failed and no cached data is available.");
      }
      // Return stale rates if available
      return currencyStore.rates;
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

  // Fetch all available currencies from API
  async fetchAllCurrencies() {
    try {
      const response = await fetch(`${this.baseUrl}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch all currencies: ${response.status}`);
      }
      const data = await response.json();
      // The API returns an object like { "usd": "United States Dollar", ... }
      // Convert it to an array of currency codes
      return Object.keys(data).map(code => code.toUpperCase()).sort();
    } catch (error) {
      console.error("Failed to fetch all currencies:", error);
      return []; // Return empty array on error
    }
  }

  // Get list of available currencies (from fetched data or major currencies as fallback)
  async getAvailableCurrencies() {
    // Try to fetch all currencies from the API
    const allCurrencies = await this.fetchAllCurrencies();
    if (allCurrencies.length > 0) {
      return allCurrencies;
    } else {
      // Fallback to major currencies if API fetch fails
      return majorCurrencies;
    }
  }

  // Get list of major currencies (for specific use cases where a smaller list is preferred)
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
