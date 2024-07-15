document.addEventListener('DOMContentLoaded', () => {                                                           
    const baseCurrencySelect = document.getElementById('base-currency');                               //references to DOM elements              
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountSpan = document.getElementById('converted-amount');
    const historicalRatesButton = document.getElementById('historical-rates');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const favoriteCurrencyPairsDiv = document.getElementById('favorite-currency-pairs');

    const API_KEY = 'fca_live_gXiYefY9djhZ1w0JC1C28pE1YzeKtQXJYRQw2PuF';
    const API_URL = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}`;

    async function fetchCurrencies() {                                                                // Fetch available currencies and populate dropdowns
        const response = await fetch(API_URL);                                                        // data fetch from api
        const data = await response.json();                                                           // convert respomse to JSON
        const currencies = Object.keys(data.data);                                                    // Get available currencies
        populateDropdowns(currencies);                                                                // Populate dropdowns with currencies
    }

    function populateDropdowns(currencies) {
        currencies.forEach(currency => {                                                                //Populate base and target currency dropdowns
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

    async function convertCurrency() {                                                                  // Fetch exchange rates and perform conversion
        const baseCurrency = baseCurrencySelect.value;                                                  // Get base currency
        const targetCurrency = targetCurrencySelect.value;                                              //  Get target currency
        const amount = parseFloat(amountInput.value);                                                   // get amount to be converted              
        if (!baseCurrency || !targetCurrency || isNaN(amount) || amount <= 0) {
            alert('Please select currencies and enter a valid amount.');
            return;
        }

        const response = await fetch(`${API_URL}&base_currency=${baseCurrency}`);                        //Fetch exchange rates
        const data = await response.json();                                                              // Response to JSOn
        const rate = data.data[targetCurrency];                                                         // Get exchange rate for target currency
        const convertedAmount = (amount * rate).toFixed(2);                                             // Perform conversion and round to 2 decimals         
        convertedAmountSpan.textContent = `${convertedAmount} ${targetCurrency}`;                       // Show converted amount
    }

    // Fetch historical rates
    async function fetchHistoricalRates() {
        const baseCurrency = baseCurrencySelect.value;                                                  // get selected base currency
        const targetCurrency = targetCurrencySelect.value;                                              // get selected target currency                                
        if (!baseCurrency || !targetCurrency) {
            alert('Please select currencies.');
            return;
        }

        const startDate = new Date();                                                                   // Get start date
        startDate.setDate(startDate.getDate() - 30);                                                    //  Calculate date 30 days ago
        const endDate = new Date();                                                                     // Get end date

        const historicalAPIURL = `https://api.freecurrencyapi.com/v1/timeseries?apikey=${API_KEY}&base_currency=${baseCurrency}&currencies=${targetCurrency}&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`;

        const response = await fetch(historicalAPIURL);                                                 // fetch historical exchange
        const data = await response.json();                                                             // Convert JSON
        displayHistoricalRates(data.data);                                                              // Show historical Rates
    }

    function displayHistoricalRates(data) {
        historicalRatesContainer.innerHTML = '<h3>Historical Rates (Last 30 Days)</h3>';
        const rates = Object.entries(data);                                                             // Get rates as data key-value pairs
        rates.forEach(([date, rate]) => {
            const rateElement = document.createElement('p');                                            // create a paragraph element
            rateElement.textContent = `${date}: ${rate[targetCurrencySelect.value].toFixed(2)}`;        //set text content
            historicalRatesContainer.appendChild(rateElement);                                         
        });
    }

    // Save favorite currency pairs
    function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;                                                 // Get selected base currency 
        const targetCurrency = targetCurrencySelect.value;                                             // get Selected target currency
        if (!baseCurrency || !targetCurrency) {                                                         //
            alert('Please select currencies.');                                                         
            return;
        }

        const favorites = JSON.parse(localStorage.getItem('favoritePairs')) || [];                      // get saved favorites from local storage
        favorites.push({ baseCurrency, targetCurrency });                                               // Add a new favorite pair
        localStorage.setItem('favoritePairs', JSON.stringify(favorites));                               // Save updated favorites to local storage
        loadFavoritePairs();                                                                            //
    }

    function loadFavoritePairs() {
        favoriteCurrencyPairsDiv.innerHTML = '<h3>Favorite Pairs</h3>';
        const favorites = JSON.parse(localStorage.getItem('favoritePairs')) || [];                      // Get the favorites from saved(local storages)
        favorites.forEach(pair => {
            const pairElement = document.createElement('p');                                            // Create a paragraph element
            pairElement.textContent = `${pair.baseCurrency} -> ${pair.targetCurrency}`;                 // Set a text content
            favoriteCurrencyPairsDiv.appendChild(pairElement);                                          
        });
    }

    // Event listeners
    document.getElementById('convert-button').addEventListener('click', convertCurrency);               // Event Listenr for convert button
    historicalRatesButton.addEventListener('click', fetchHistoricalRates);                              // Event Listener for historical rates
    saveFavoriteButton.addEventListener('click', saveFavoritePair);                                     // event listener for saving favoirtes

    // Initialize the app
    fetchCurrencies();                                                                                  // Fetch available currencies on load 
    loadFavoritePairs();                                                                                // Load saved favorite pairs on load
});