const converterForm = document.getElementById("converter-form");
const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");
const amountInput = document.getElementById("amount");
const resultDiv = document.getElementById("result");
const loadingSpinner = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");

// Cache configuration
const CACHE_KEY = 'exchangeRateCache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Clear any existing cache on page load for testing
localStorage.clear();

// Initialize UI
loadingSpinner.classList.add('hidden');
errorMessage.classList.add('hidden');

window.addEventListener("load", fetchCurrencies);
converterForm.addEventListener("submit", convertCurrency);

// Helper functions for UI state
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    resultDiv.textContent = '';
    console.log('Loading spinner shown'); // Debug log
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    console.log('Loading spinner hidden'); // Debug log
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    resultDiv.textContent = '';
    console.log('Error shown:', message); // Debug log
}

// Cache management functions
function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
    }
    return data;
}

function setCacheData(key, data) {
    const cacheData = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

async function fetchCurrencies() {
    try {
        console.log('Starting fetchCurrencies'); // Debug log
        showLoading();
        
        // Check cache first
        const cachedCurrencies = getCachedData('currencies');
        if (cachedCurrencies) {
            console.log('Using cached currencies'); // Debug log
            populateCurrencyDropdowns(cachedCurrencies);
            hideLoading();
            return;
        }

        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        if (!response.ok) {
            throw new Error('Failed to fetch currencies');
        }

        const data = await response.json();
        const currencyOptions = Object.keys(data.rates);
        
        // Cache the currencies
        setCacheData('currencies', currencyOptions);
        
        populateCurrencyDropdowns(currencyOptions);
    } catch (error) {
        showError('Failed to load currencies. Please try again later.');
        console.error('Currency fetch error:', error);
    } finally {
        hideLoading();
    }
}

function populateCurrencyDropdowns(currencies) {
    // Clear existing options
    fromCurrency.innerHTML = '';
    toCurrency.innerHTML = '';

    currencies.forEach((currency) => {
        const option1 = document.createElement("option");
        option1.value = currency;
        option1.textContent = currency;
        fromCurrency.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = currency;
        option2.textContent = currency;
        toCurrency.appendChild(option2);
    });
}

async function convertCurrency(e) {
    e.preventDefault();

    try {
        // Input validation
        const amount = parseFloat(amountInput.value);
        const fromCurrencyValue = fromCurrency.value;
        const toCurrencyValue = toCurrency.value;

        if (isNaN(amount) || amount < 0) {
            showError("Please enter a valid positive number");
            return;
        }

        showLoading();

        // Check cache for exchange rates
        const cacheKey = `rates_${fromCurrencyValue}`;
        const cachedRates = getCachedData(cacheKey);
        
        let rate;
        if (cachedRates && cachedRates[toCurrencyValue]) {
            rate = cachedRates[toCurrencyValue];
        } else {
            // Fetch fresh rates if not in cache
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrencyValue}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }

            const data = await response.json();
            rate = data.rates[toCurrencyValue];

            // Cache the new rates
            setCacheData(cacheKey, data.rates);
        }

        const convertedAmount = (amount * rate).toFixed(2);
        resultDiv.textContent = `${amount.toLocaleString()} ${fromCurrencyValue} = ${parseFloat(convertedAmount).toLocaleString()} ${toCurrencyValue}`;
        
    } catch (error) {
        showError('Failed to convert currency. Please try again later.');
        console.error('Conversion error:', error);
    } finally {
        hideLoading();
    }
}