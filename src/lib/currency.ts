let exchangeRates: { [key: string]: number } | null = null;
const BASE_CURRENCY = 'USD';

async function fetchExchangeRates() {
    if (exchangeRates) {
        return exchangeRates;
    }
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`);
        const data = await response.json();
        if (data && data.rates) {
            exchangeRates = data.rates;
            return exchangeRates;
        }
        throw new Error('Failed to fetch exchange rates');
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        // Fallback to static rates in case of API failure
        return {
            USD: 1.0,
            EUR: 0.92,
            GBP: 0.79,
            CAD: 1.37,
            JPY: 157.0,
        };
    }
}

export const getSupportedCurrencies = async (): Promise<string[]> => {
    const rates = await fetchExchangeRates();
    return Object.keys(rates);
}

export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
  const rates = await fetchExchangeRates();
  
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rateFrom = rates[fromCurrency];
  const rateTo = rates[toCurrency];

  if (!rateFrom || !rateTo) {
    throw new Error('Unsupported currency for conversion');
  }

  const amountInBase = amount / rateFrom;
  const convertedAmount = amountInBase * rateTo;

  return parseFloat(convertedAmount.toFixed(2));
};

// Pre-fetch rates on server start
fetchExchangeRates();

export const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD', 'CHF', 'CNY', 'INR'];
