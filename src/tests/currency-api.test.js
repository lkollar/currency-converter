import { describe, it, expect, beforeEach, vi } from "vitest";
import { currencyAPI } from "../services/currency-api.js";
import { currencyStore } from "../store/currency-store.js";

// Mock fetch
global.fetch = vi.fn();

// Mock currency store
vi.mock("../store/currency-store.js", () => ({
  currencyStore: {
    rates: {},
    setRates: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    areRatesStale: vi.fn(),
  },
}));

describe("CurrencyAPI", () => {
  beforeEach(() => {
    // Reset mocks
    fetch.mockClear();
    currencyStore.setRates.mockClear();
    currencyStore.setLoading.mockClear();
    currencyStore.setError.mockClear();
    currencyStore.areRatesStale.mockClear();

    // Reset store state
    currencyStore.rates = {};
  });

  describe("fetchRates", () => {
    it("should fetch and process exchange rates successfully", async () => {
      const mockApiResponse = {
        date: "2024-01-01",
        usd: {
          eur: 0.92,
          gbp: 0.79,
          jpy: 149.85,
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await currencyAPI.fetchRates();

      expect(fetch).toHaveBeenCalledWith(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      );
      expect(currencyStore.setLoading).toHaveBeenCalledWith(true);
      expect(currencyStore.setLoading).toHaveBeenCalledWith(false);
      expect(currencyStore.setError).toHaveBeenCalledWith(null);
      expect(currencyStore.setRates).toHaveBeenCalledWith({
        usd: 1,
        eur: 0.92,
        gbp: 0.79,
        jpy: 149.85,
      });
      expect(result).toEqual({
        usd: 1,
        eur: 0.92,
        gbp: 0.79,
        jpy: 149.85,
      });
    });

    it("should handle HTTP errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(currencyAPI.fetchRates()).rejects.toThrow(
        "API fetch failed and no cached data is available.",
      );

      expect(currencyStore.setLoading).toHaveBeenCalledWith(true);
      expect(currencyStore.setLoading).toHaveBeenCalledWith(false);
      expect(currencyStore.setError).toHaveBeenCalledWith("Could not fetch new rates. Displaying last saved data.");
    });

    it("should handle network errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(currencyAPI.fetchRates()).rejects.toThrow("API fetch failed and no cached data is available.");

      expect(currencyStore.setLoading).toHaveBeenCalledWith(true);
      expect(currencyStore.setLoading).toHaveBeenCalledWith(false);
      expect(currencyStore.setError).toHaveBeenCalledWith("Could not fetch new rates. Displaying last saved data.");
    });

    it("should handle invalid API response format", async () => {
      const mockApiResponse = {
        date: "2024-01-01",
        // Missing usd key
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      await expect(currencyAPI.fetchRates()).rejects.toThrow(
        "API fetch failed and no cached data is available.",
      );
    });
  });

  describe("getRates", () => {
    it("should return cached rates if they are fresh", async () => {
      currencyStore.rates = { usd: 1, eur: 0.92 };
      currencyStore.areRatesStale.mockReturnValue(false);

      const result = await currencyAPI.getRates();

      expect(result).toEqual({ usd: 1, eur: 0.92 });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should fetch fresh rates if cache is stale", async () => {
      currencyStore.rates = {};
      currencyStore.areRatesStale.mockReturnValue(true);

      const mockApiResponse = {
        date: "2024-01-01",
        usd: { eur: 0.92 },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await currencyAPI.getRates();

      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual({ usd: 1, eur: 0.92 });
    });

    it("should fetch fresh rates if no cached rates exist", async () => {
      currencyStore.rates = {};
      currencyStore.areRatesStale.mockReturnValue(false); // Fresh but empty

      const mockApiResponse = {
        date: "2024-01-01",
        usd: { eur: 0.92 },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      await currencyAPI.getRates();

      expect(fetch).toHaveBeenCalled();
    });
  });

  describe("initialize", () => {
    it("should use cached rates if they are fresh", async () => {
      currencyStore.rates = { usd: 1, eur: 0.92 };
      currencyStore.areRatesStale.mockReturnValue(false);

      const result = await currencyAPI.initialize();

      expect(result).toEqual({ usd: 1, eur: 0.92 });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should fetch fresh rates if cache is stale", async () => {
      currencyStore.rates = { usd: 1, eur: 0.85 };
      currencyStore.areRatesStale.mockReturnValue(true);

      const mockApiResponse = {
        date: "2024-01-01",
        usd: { eur: 0.92 },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await currencyAPI.initialize();

      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual({ usd: 1, eur: 0.92 });
    });

    it("should fallback to cached rates if fetch fails", async () => {
      currencyStore.rates = { usd: 1, eur: 0.85 };
      currencyStore.areRatesStale.mockReturnValue(true);

      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await currencyAPI.initialize();

      expect(result).toEqual({ usd: 1, eur: 0.85 });
    });

    it("should throw error if fetch fails and no cached rates exist", async () => {
      currencyStore.rates = {};
      currencyStore.areRatesStale.mockReturnValue(true);

      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(currencyAPI.initialize()).rejects.toThrow("API fetch failed and no cached data is available.");
    });
  });

  describe("getAvailableCurrencies", () => {
    it("should return sorted list of available currencies", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          usd: "US Dollar",
          eur: "Euro",
          gbp: "British Pound",
          jpy: "Japanese Yen",
        }),
      });
      const result = await currencyAPI.getAvailableCurrencies();

      expect(result).toEqual(["EUR", "GBP", "JPY", "USD"]);
    });

    it("should return major currencies if no rates available from API", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}), // Simulate no currencies available from API
      });
      const result = await currencyAPI.getAvailableCurrencies();

      // Expect fallback to majorCurrencies
      expect(result).toEqual([
        "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "KRW", 
        "SGD", "HKD", "NOK", "SEK", "DKK", "PLN", "CZK", "HUF", "RUB", "BRL", 
        "MXN", "ZAR", "NZD", "TRY", "AED", "THB", "MYR", "IDR", "PHP", "VND", 
        "ILS", "EGP", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "LBP",
      ]);
    });
  });

  describe("isCurrencySupported", () => {
    beforeEach(() => {
      currencyStore.rates = {
        usd: 1,
        eur: 0.92,
        gbp: 0.79,
      };
    });

    it("should return true for supported currency", () => {
      expect(currencyAPI.isCurrencySupported("USD")).toBe(true);
      expect(currencyAPI.isCurrencySupported("usd")).toBe(true);
      expect(currencyAPI.isCurrencySupported("EUR")).toBe(true);
    });

    it("should return false for unsupported currency", () => {
      expect(currencyAPI.isCurrencySupported("UNKNOWN")).toBe(false);
      expect(currencyAPI.isCurrencySupported("XYZ")).toBe(false);
    });
  });

  describe("getCurrencyName", () => {
    it("should return currency name for known currencies", () => {
      expect(currencyAPI.getCurrencyName("USD")).toBe("US Dollar");
      expect(currencyAPI.getCurrencyName("EUR")).toBe("Euro");
      expect(currencyAPI.getCurrencyName("GBP")).toBe("British Pound");
      expect(currencyAPI.getCurrencyName("JPY")).toBe("Japanese Yen");
    });

    it("should return currency code for unknown currencies", () => {
      expect(currencyAPI.getCurrencyName("UNKNOWN")).toBe("UNKNOWN");
      expect(currencyAPI.getCurrencyName("XYZ")).toBe("XYZ");
    });

    it("should handle lowercase input", () => {
      expect(currencyAPI.getCurrencyName("usd")).toBe("US Dollar");
      expect(currencyAPI.getCurrencyName("eur")).toBe("Euro");
    });
  });

  describe("getCurrencyFlag", () => {
    it("should return flag emoji for known currencies", () => {
      expect(currencyAPI.getCurrencyFlag("USD")).toBe("🇺🇸");
      expect(currencyAPI.getCurrencyFlag("EUR")).toBe("🇪🇺");
      expect(currencyAPI.getCurrencyFlag("GBP")).toBe("🇬🇧");
      expect(currencyAPI.getCurrencyFlag("JPY")).toBe("🇯🇵");
    });

    it("should return default flag for unknown currencies", () => {
      expect(currencyAPI.getCurrencyFlag("UNKNOWN")).toBe("🏳️");
      expect(currencyAPI.getCurrencyFlag("XYZ")).toBe("🏳️");
    });

    it("should handle lowercase input", () => {
      expect(currencyAPI.getCurrencyFlag("usd")).toBe("🇺🇸");
      expect(currencyAPI.getCurrencyFlag("eur")).toBe("🇪🇺");
    });
  });

  describe("Currency Name/Flag Alignment", () => {
    it("should have perfect alignment between currency names and flags", () => {
      // Get the actual internal mappings by accessing the implementation
      const testInstance = new currencyAPI.constructor();

      // Extract currency codes that have custom names (not just the code itself)
      const currenciesWithNames = new Set();
      const currenciesWithFlags = new Set();

      // Test a wide range of currency codes to find which have custom mappings
      const allPossibleCurrencies = [
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
        "ILS",
        "EGP",
        "SAR",
        "QAR",
        "KWD",
        "BHD",
        "OMR",
        "JOD",
        "LBP",
        "RON",
        "BGN",
        "HRK",
        "RSD",
        "ISK",
        "CLP",
        "PEN",
        "COP",
        "ARS",
        "UYU",
        "TWD",
        "XYZ",
        "ABC",
        "DEF", // Test some invalid codes too
      ];

      allPossibleCurrencies.forEach((currency) => {
        const name = testInstance.getCurrencyName(currency);
        const flag = testInstance.getCurrencyFlag(currency);

        // If currency has a proper name (not just the code), add to names set
        if (name !== currency) {
          currenciesWithNames.add(currency);
        }

        // If currency has a custom flag (not default), add to flags set
        if (flag !== "🏳️") {
          currenciesWithFlags.add(currency);
        }
      });

      // Find currencies that have names but no flags
      const namesWithoutFlags = [...currenciesWithNames].filter(
        (currency) => !currenciesWithFlags.has(currency),
      );

      // Find currencies that have flags but no names
      const flagsWithoutNames = [...currenciesWithFlags].filter(
        (currency) => !currenciesWithNames.has(currency),
      );

      // The intersection of mismatched currencies should be empty
      expect(namesWithoutFlags).toEqual([]);
      expect(flagsWithoutNames).toEqual([]);

      // Ensure we have substantial coverage
      expect(currenciesWithNames.size).toBeGreaterThan(20);
      expect(currenciesWithFlags.size).toBeGreaterThan(20);

      // Ensure perfect alignment
      expect(currenciesWithNames.size).toBe(currenciesWithFlags.size);
    });
  });
});
