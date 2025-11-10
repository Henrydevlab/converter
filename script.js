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
    console.log('Showing loading spinner...'); // Debug log
    loadingSpinner.style.display = 'flex';
    loadingSpinner.style.opacity = '1';
    loadingSpinner.style.visibility = 'visible';
    loadingSpinner.classList.remove('hidden');
    clearError();
    resultDiv.textContent = '';
    console.log('Loading spinner element:', loadingSpinner); // Debug element
    console.log('Loading spinner classes:', loadingSpinner.className); // Debug classes
}

function hideLoading() {
    console.log('Hiding loading spinner...'); // Debug log
    loadingSpinner.classList.add('hidden');
    console.log('Loading spinner classes after hide:', loadingSpinner.className); // Debug classes
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    resultDiv.textContent = '';
    amountInput.classList.add('error');
    console.log('Error shown:', message); // Debug log
}

function clearError() {
    errorMessage.classList.add('hidden');
    amountInput.classList.remove('error');
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

// Helper function to create a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchCurrencies() {
    try {
        console.log('Starting fetchCurrencies'); // Debug log
        showLoading();
        
        // Add shorter delay to keep UI responsive while still showing loading state
        await delay(800);  // 0.8 second delay
        
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
        const inputValue = amountInput.value.trim();
        const hasSpecialChars = /[^0-9.]/.test(inputValue);
        const amount = parseFloat(inputValue);
        const fromCurrencyValue = fromCurrency.value;
        const toCurrencyValue = toCurrency.value;

        // Comprehensive input validation
        if (inputValue === '') {
            showError("Please enter an amount to convert");
            return;
        }
        if (hasSpecialChars) {
            showError("Special characters or letters are not allowed");
            return;
        }
        if (isNaN(amount)) {
            showError("Please enter a valid number");
            return;
        }
        if (amount < 0) {
            showError("Amount cannot be negative");
            return;
        }
        if (amount === 0) {
            showError("Amount must be greater than zero");
            return;
        }
        if (amount > 999999999) {
            showError("Amount is too large. Please enter a smaller number");
            return;
        }
        if (fromCurrencyValue === toCurrencyValue) {
            showError("Please select different currencies to convert");
            return;
        }

        showLoading();
        console.log('Converting currency...');
        
        // Add shorter delay to keep UI responsive
        await delay(800);  // 0.8 second delay

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