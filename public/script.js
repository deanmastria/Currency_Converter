document.addEventListener('DOMContentLoaded', () => {
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

    const API_KEY = 'fca_live_gXiYefY9djhZ1w0JC1C28pE1YzeKtQXJYRQw2PuF'; // Replace with your API key
    const API_URL = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}`;

    async function fetchCurrencies() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch currencies. Please try again later.');
            }
            const data = await response.json();
            const currencies = Object.keys(data.data);
            populateDropdowns(currencies);
        } catch (error) {
            displayErrorMessage(error.message);
        }
    }

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

        // Add the fetched currencies
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
    }

    async function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

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
            const response = await fetch(`${API_URL}&base_currency=${baseCurrency}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates. Please try again later.');
            }
            const data = await response.json();
            const rate = data.data[targetCurrency];
            const convertedAmount = (amount * rate).toFixed(2);
            convertedAmountSpan.textContent = `${convertedAmount} ${targetCurrency}`;
            clearErrorMessage();
        } catch (error) {
            displayErrorMessage(error.message);
        }
    }

    async function fetchHistoricalRate() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const selectedDate = historicalDateInput.value;

        if (!baseCurrency || !targetCurrency || !selectedDate) {
            displayErrorMessage('Please select both currencies and a date.');
            return;
        }

        try {
            const historicalAPIURL = `https://api.freecurrencyapi.com/v1/historical?apikey=${API_KEY}&base_currency=${baseCurrency}&currencies=${targetCurrency}&date=${selectedDate}`;

            const response = await fetch(historicalAPIURL);
            if (!response.ok) {
                const errorResponse = await response.text();
                console.error('Error response:', errorResponse); // Debugging line
                throw new Error('Failed to fetch historical rate. Please try again later.');
            }
            const data = await response.json();
            const rate = data.data[selectedDate][targetCurrency];
            historicalRateResult.textContent = `Historical exchange rate on ${selectedDate}: 1 ${baseCurrency} = ${rate.toFixed(4)} ${targetCurrency}`;
            clearErrorMessage();
        } catch (error) {
            displayErrorMessage(error.message);
        }
    }

    async function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        if (!baseCurrency || !targetCurrency) {
            displayErrorMessage('Please select both base and target currencies.');
            return;
        }

        try {
            const favorites = await loadFavoritePairsFromDB();

            // Check if the favorite pair already exists
            const exists = favorites.some(pair => pair.baseCurrency === baseCurrency && pair.targetCurrency === targetCurrency);
            if (exists) {
                displayErrorMessage('Favorite pair already exists.');
                return;
            }

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
            loadFavoritePairs();
            clearErrorMessage();
        } catch (error) {
            displayErrorMessage(error.message);
        }
    }

    async function loadFavoritePairs() {
        try {
            const favorites = await loadFavoritePairsFromDB();

            favoriteCurrencyPairsDiv.innerHTML = '<h3>Favorite Pairs</h3>';
            favoritePairResultsDiv.innerHTML = ''; // Clear previous results
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
            displayErrorMessage(error.message);
        }
    }

    async function loadFavoritePairsFromDB() {
        const response = await fetch('/api/favorites');
        if (!response.ok) {
            throw new Error('Failed to load favorite pairs. Please try again later.');
        }
        return await response.json();
    }

    async function deleteFavoritePair(baseCurrency, targetCurrency) {
        try {
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
            loadFavoritePairs();
            clearErrorMessage();
        } catch (error) {
            displayErrorMessage(error.message);
        }
    }

    async function displayFavoritePairConversion(baseCurrency, targetCurrency) {
        const amount = 1; // Always convert 1 unit for favorite pair display

        if (!baseCurrency || !targetCurrency) {
            displayErrorMessage('Invalid currency pair.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}&base_currency=${baseCurrency}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates. Please try again later.');
            }
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
            displayErrorMessage(error.message);
        }
    }

    function displayErrorMessage(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }

    function clearErrorMessage() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }

    document.getElementById('convert-button').addEventListener('click', convertCurrency);
    fetchHistoricalRateButton.addEventListener('click', fetchHistoricalRate); // Fetch specific historical rate for selected date
    saveFavoriteButton.addEventListener('click', saveFavoritePair);

    fetchCurrencies();
    loadFavoritePairs();
});
