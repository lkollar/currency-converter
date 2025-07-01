import { describe, it, expect, beforeEach, vi } from "vitest";
import { currencyStore } from "../store/currency-store.js";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe("CurrencyStore", () => {
  beforeEach(() => {
    // Reset store state
    currencyStore.rates = {};
    currencyStore.userCurrencies = ["USD", "EUR", "GBP", "JPY"];
    currencyStore.activeCurrency = "USD";
    currencyStore.activeAmount = 1000;
    currencyStore.lastUpdated = null;
    currencyStore.isLoading = false;
    currencyStore.error = null;

    // Clear localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe("setRates", () => {
    it("should set exchange rates and update timestamp", () => {
      const rates = { usd: 1, eur: 0.92, gbp: 0.79 };

      currencyStore.setRates(rates);

      expect(currencyStore.rates).toEqual(rates);
      expect(currencyStore.lastUpdated).toBeTypeOf("number");
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe("setActiveCurrency", () => {
    it("should set active currency and amount", () => {
      currencyStore.setActiveCurrency("EUR", 500);

      expect(currencyStore.activeCurrency).toBe("EUR");
      expect(currencyStore.activeAmount).toBe(500);
    });

    it("should set active currency without changing amount", () => {
      currencyStore.activeAmount = 1000;
      currencyStore.setActiveCurrency("GBP");

      expect(currencyStore.activeCurrency).toBe("GBP");
      expect(currencyStore.activeAmount).toBe(1000);
    });

    it("should convert currency code to uppercase", () => {
      currencyStore.setActiveCurrency("eur");

      expect(currencyStore.activeCurrency).toBe("EUR");
    });
  });

  describe("setActiveAmount", () => {
    it("should set active amount", () => {
      currencyStore.setActiveAmount(750);

      expect(currencyStore.activeAmount).toBe(750);
    });

    it("should handle invalid amounts", () => {
      currencyStore.setActiveAmount("invalid");

      expect(currencyStore.activeAmount).toBe(0);
    });
  });

  describe("addCurrency", () => {
    it("should add new currency to user list", () => {
      currencyStore.addCurrency("CAD");

      expect(currencyStore.userCurrencies).toContain("CAD");
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should not add duplicate currency", () => {
      currencyStore.userCurrencies = ["USD", "EUR"];
      currencyStore.addCurrency("USD");

      expect(currencyStore.userCurrencies).toEqual(["USD", "EUR"]);
    });

    it("should convert currency code to uppercase", () => {
      currencyStore.addCurrency("cad");

      expect(currencyStore.userCurrencies).toContain("CAD");
    });
  });

  describe("removeCurrency", () => {
    it("should remove currency from user list", () => {
      currencyStore.userCurrencies = ["USD", "EUR", "GBP"];
      currencyStore.removeCurrency("EUR");

      expect(currencyStore.userCurrencies).toEqual(["USD", "GBP"]);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should switch active currency if removed currency was active", () => {
      currencyStore.userCurrencies = ["USD", "EUR", "GBP"];
      currencyStore.activeCurrency = "EUR";
      currencyStore.removeCurrency("EUR");

      expect(currencyStore.activeCurrency).toBe("USD");
    });
  });

  describe("convertAmount", () => {
    beforeEach(() => {
      currencyStore.rates = {
        usd: 1,
        eur: 0.92,
        gbp: 0.79,
        jpy: 149.85,
      };
    });

    it("should convert from USD to other currency", () => {
      const result = currencyStore.convertAmount("USD", "EUR", 100);

      expect(result).toBe(92);
    });

    it("should convert from other currency to USD", () => {
      const result = currencyStore.convertAmount("EUR", "USD", 92);

      expect(result).toBeCloseTo(100, 1);
    });

    it("should convert between two non-USD currencies", () => {
      const result = currencyStore.convertAmount("EUR", "GBP", 100);

      // EUR -> USD -> GBP: 100 / 0.92 * 0.79
      expect(result).toBeCloseTo(85.87, 1);
    });

    it("should return same amount for same currency", () => {
      const result = currencyStore.convertAmount("USD", "USD", 100);

      expect(result).toBe(100);
    });

    it("should return 0 for unknown currencies", () => {
      const result = currencyStore.convertAmount("USD", "UNKNOWN", 100);

      expect(result).toBe(0);
    });
  });

  describe("getAllAmounts", () => {
    beforeEach(() => {
      currencyStore.rates = {
        usd: 1,
        eur: 0.92,
        gbp: 0.79,
        jpy: 149.85,
      };
      currencyStore.userCurrencies = ["USD", "EUR", "GBP", "JPY"];
      currencyStore.activeCurrency = "USD";
      currencyStore.activeAmount = 100;
    });

    it("should return amounts for all user currencies", () => {
      const amounts = currencyStore.getAllAmounts();

      expect(amounts).toEqual({
        USD: 100,
        EUR: 92,
        GBP: 79,
        JPY: 14985,
      });
    });

    it("should use active amount for active currency", () => {
      currencyStore.activeCurrency = "EUR";
      currencyStore.activeAmount = 50;

      const amounts = currencyStore.getAllAmounts();

      expect(amounts.EUR).toBe(50);
    });
  });

  describe("areRatesStale", () => {
    it("should return true if no lastUpdated timestamp", () => {
      currencyStore.lastUpdated = null;

      expect(currencyStore.areRatesStale()).toBe(true);
    });

    it("should return true for rates older than 24 hours", () => {
      const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
      currencyStore.lastUpdated = twentyFiveHoursAgo;

      expect(currencyStore.areRatesStale()).toBe(true);
    });

    it("should return false for fresh rates", () => {
      const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;
      currencyStore.lastUpdated = oneHourAgo;

      expect(currencyStore.areRatesStale()).toBe(false);
    });
  });

  describe("localStorage integration", () => {
    it("should save state to localStorage", () => {
      currencyStore.rates = { usd: 1, eur: 0.92 };
      currencyStore.userCurrencies = ["USD", "EUR"];

      currencyStore.saveToStorage();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "currency-store",
        expect.stringContaining('"usd":1'),
      );
    });

    it("should load state from localStorage", () => {
      const mockState = {
        rates: { usd: 1, eur: 0.92 },
        userCurrencies: ["USD", "EUR"],
        activeCurrency: "EUR",
        activeAmount: 500,
        lastUpdated: 1234567890,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));

      currencyStore.loadFromStorage();

      expect(currencyStore.rates).toEqual(mockState.rates);
      expect(currencyStore.userCurrencies).toEqual(mockState.userCurrencies);
      expect(currencyStore.activeCurrency).toBe("EUR");
      expect(currencyStore.activeAmount).toBe(500);
      expect(currencyStore.lastUpdated).toBe(1234567890);
    });

    it("should handle localStorage errors gracefully", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      expect(() => currencyStore.loadFromStorage()).not.toThrow();
    });
  });

  describe("subscription system", () => {
    it("should notify subscribers on state changes", () => {
      const listener = vi.fn();

      currencyStore.subscribe(listener);
      currencyStore.setActiveAmount(500);

      expect(listener).toHaveBeenCalledWith(currencyStore);
    });

    it("should unsubscribe listeners", () => {
      const listener = vi.fn();

      const unsubscribe = currencyStore.subscribe(listener);
      unsubscribe();
      currencyStore.setActiveAmount(500);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
