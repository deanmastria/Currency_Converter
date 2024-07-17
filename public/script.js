// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountSpan = document.getElementById('converted-amount');
    const historicalDateInput = document.getElementById('historical-date');
    const fetchHistoricalRateButton = document.getElementById('fetch-historical-rate');
    const historicalRateResult = document.getElementById('historical-rate-result');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const favoriteCurrencyPairsDiv = document.getElementById('favorite-currency-pairs');
    const favoritePairResultsDiv = document.getElementById('favorite-pair-results');
    const errorMessageDiv = document.getElementById('error-message');
    const baseCurrencyLabel = document.getElementById('base-currency-label');

    // Define the API key and URL for fetching currency data
    const API_KEY = 'fca_live_gXiYefY9djhZ1w0JC1C28pE1YzeKtQXJYRQw2PuF'; // Replace with your API key
    const API_URL = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}`;

    // Function to fetch currencies from the API
    async function fetchCurrencies() {
        try {
            // Make a request to the API
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch currencies. Please try again later.');
            }
            // Parse the JSON response
            const data = await response.json();
            const currencies = Object.keys(data.data);
            // Populate the dropdowns with the fetched currencies
            populateDropdowns(currencies);
        } catch (error) {
            // Display an error message if fetching fails
            displayErrorMessage(error.message);
        }
    }

    // Function to populate the dropdowns with currency options
    function populateDropdowns(currencies) {
        // Clear existing options except the first placeholder
        baseCurrencySelect.length = 1;
        targetCurrencySelect.length = 1;

        // Add a few default currencies for immediate user interaction
        const defaultCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];
        defaultCurrencies.forEach(currency => {
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            option2.value = currency;
            option2.textContent = currency;
            baseCurrencySelect.appendChild(option1);
            targetCurrencySelect.appendChild(option2);
        });

        // Add the fetched currencies to the dropdowns
        currencies.forEach(currency => {
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            option2.value = currency;
            option2.textContent = currency;
            baseCurrencySelect.appendChild(option1);
            targetCurrencySelect.appendChild(option2);
        });

        // Update the base currency label to the first selected option
        updateBaseCurrencyLabel();
    }

    // Function to update the base currency label
    function updateBaseCurrencyLabel() {
        baseCurrencyLabel.textContent = baseCurrencySelect.value;
    }

    // Function to format the amount input to two decimal places
    function formatAmountInput() {
        const value = parseFloat(amountInput.value).toFixed(2);
        amountInput.value = isNaN(value) ? '0.00' : value;
    }

    // Function to convert the currency
    async function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value).toFixed(2); // Ensure amount has two decimal places

        // Validate the inputs
        if (!baseCurrency || !targetCurrency) {
            displayErrorMessage('Please select both base and target currencies.');
            return;
        }

        if (baseCurrency === targetCurrency) {
            displayErrorMessage('Base and target currencies cannot be the same.');
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            displayErrorMessage('Please enter a valid amount greater than zero.');
            return;
        }

        try {
            // Make a request to the API for exchange rates
            const response = await fetch(`${API_URL}&base_currency=${baseCurrency}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates. Please try again later.');
            }
            // Parse the JSON response
            const data = await response.json();
            const rate = data.data[targetCurrency];
            const convertedAmount = (amount * rate).toFixed(2); // Ensure converted amount has two decimal places
            convertedAmountSpan.textContent = `${convertedAmount} ${targetCurrency}`;
            clearErrorMessage();
        } catch (error) {
            // Display an error message if fetching or conversion fails
            displayErrorMessage(error.message);
        }
    }

    // Function to fetch historical exchange rates
    async function fetchHistoricalRate() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const selectedDate = historicalDateInput.value;

        // Validate the inputs
        if (!baseCurrency || !targetCurrency || !selectedDate) {
            displayErrorMessage('Please select both currencies and a date.');
            return;
        }

        try {
            // Construct the URL for fetching historical rates
            const historicalAPIURL = `https://api.freecurrencyapi.com/v1/historical?apikey=${API_KEY}&base_currency=${baseCurrency}&currencies=${targetCurrency}&date=${selectedDate}`;

            // Make a request to the API for historical rates
            const response = await fetch(historicalAPIURL);
            if (!response.ok) {
                const errorResponse = await response.text();
                console.error('Error response:', errorResponse); // Debugging line
                throw new Error('Failed to fetch historical rate. Please try again later.');
            }
            // Parse the JSON response
            const data = await response.json();
            const rate = data.data[selectedDate][targetCurrency];
            historicalRateResult.textContent = `Historical exchange rate on ${selectedDate}: 1 ${baseCurrency} = ${rate.toFixed(4)} ${targetCurrency}`;
            clearErrorMessage();
        } catch (error) {
            // Display an error message if fetching fails
            displayErrorMessage(error.message);
        }
    }

    // Function to save a favorite currency pair
    async function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        // Validate the inputs
        if (!baseCurrency || !targetCurrency) {
            displayErrorMessage('Please select both base and target currencies.');
            return;
        }

        try {
            // Load existing favorite pairs from the database
            const favorites = await loadFavoritePairsFromDB();

            // Check if the favorite pair already exists
            const exists = favorites.some(pair => pair.baseCurrency === baseCurrency && pair.targetCurrency === targetCurrency);
            if (exists) {
                displayErrorMessage('Favorite pair already exists.');
                return;
            }

            // Make a request to save the favorite pair
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ baseCurrency, targetCurrency })
            });

            if (!response.ok) {
                throw new Error('Failed to save favorite pair. Please try again later.');
            }
            // Reload the favorite pairs
            loadFavoritePairs();
            clearErrorMessage();
        } catch (error) {
            // Display an error message if saving fails
            displayErrorMessage(error.message);
        }
    }

    // Function to load favorite currency pairs
    async function loadFavoritePairs() {
        try {
            // Load favorite pairs from the database
            const favorites = await loadFavoritePairsFromDB();

            // Clear the favorite pairs display
            favoriteCurrencyPairsDiv.innerHTML = '<h3>Favorite Pairs</h3>';
            favoritePairResultsDiv.innerHTML = ''; // Clear previous results

            // Display each favorite pair with conversion and remove buttons
            favorites.forEach(pair => {
                const pairElement = document.createElement('div');
                pairElement.className = 'favorite-pair d-flex align-items-center mb-2';

                const pairButton = document.createElement('button');
                pairButton.textContent = `${pair.baseCurrency}/${pair.targetCurrency}`;
                pairButton.className = 'btn btn-outline-secondary flex-grow-1';
                pairButton.addEventListener('click', () => {
                    displayFavoritePairConversion(pair.baseCurrency, pair.targetCurrency);
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Remove';
                deleteButton.className = 'btn btn-danger ml-2';
                deleteButton.addEventListener('click', () => {
                    deleteFavoritePair(pair.baseCurrency, pair.targetCurrency);
                });

                pairElement.appendChild(pairButton);
                pairElement.appendChild(deleteButton);
                favoriteCurrencyPairsDiv.appendChild(pairElement);
            });
        } catch (error) {
            // Display an error message if loading fails
            displayErrorMessage(error.message);
        }
    }

    // Function to load favorite pairs from the database
    async function loadFavoritePairsFromDB() {
        const response = await fetch('/api/favorites');
        if (!response.ok) {
            throw new Error('Failed to load favorite pairs. Please try again later.');
        }
        return await response.json();
    }

    // Function to delete a favorite currency pair
    async function deleteFavoritePair(baseCurrency, targetCurrency) {
        try {
            // Make a request to delete the favorite pair
            const response = await fetch('/api/favorites', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ baseCurrency, targetCurrency })
            });

            if (!response.ok) {
                throw new Error('Failed to delete favorite pair. Please try again later.');
            }
            // Reload the favorite pairs
            loadFavoritePairs();
            clearErrorMessage();
        } catch (error) {
            // Display an error message if deletion fails
            displayErrorMessage(error.message);
        }
    }

    // Function to display the conversion rate of a favorite pair
    async function displayFavoritePairConversion(baseCurrency, targetCurrency) {
        const amount = 1; // Always convert 1 unit for favorite pair display

        // Validate the inputs
        if (!baseCurrency || !targetCurrency) {
            displayErrorMessage('Invalid currency pair.');
            return;
        }

        try {
            // Make a request to the API for exchange rates
            const response = await fetch(`${API_URL}&base_currency=${baseCurrency}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates. Please try again later.');
            }
            // Parse the JSON response
            const data = await response.json();
            const rate = data.data[targetCurrency];
            const resultElement = document.createElement('p');
            resultElement.textContent = `1 ${baseCurrency} = ${rate.toFixed(4)} ${targetCurrency}`;

            // Clear previous conversion results for the same pair before appending
            const existingResult = Array.from(favoritePairResultsDiv.children).find(
                el => el.textContent.startsWith(`1 ${baseCurrency}`)
            );
            if (existingResult) {
                favoritePairResultsDiv.removeChild(existingResult);
            }

            favoritePairResultsDiv.appendChild(resultElement);
            clearErrorMessage();
        } catch (error) {
            // Display an error message if fetching or conversion fails
            displayErrorMessage(error.message);
        }
    }

    // Function to display an error message
    function displayErrorMessage(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }

    // Function to clear the error message
    function clearErrorMessage() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }

    // Event listeners for various user interactions
    baseCurrencySelect.addEventListener('change', updateBaseCurrencyLabel);
    document.getElementById('convert-button').addEventListener('click', convertCurrency);
    fetchHistoricalRateButton.addEventListener('click', fetchHistoricalRate); // Fetch specific historical rate for selected date
    saveFavoriteButton.addEventListener('click', saveFavoritePair);
    amountInput.addEventListener('change', formatAmountInput);
    amountInput.addEventListener('blur', formatAmountInput);

    // Initial fetch of currencies and loading of favorite pairs
    fetchCurrencies();
    loadFavoritePairs();
});
