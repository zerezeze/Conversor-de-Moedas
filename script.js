const apiKey = 'fa2ce31e07b28aa1341fd4db';
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;

// Mapa de siglas para nomes completos das moedas
const currencyMap = {
  USD: "Dólar Americano",
  EUR: "Euro",
  GBP: "Libra Esterlina",
  JPY: "Iene Japonês",
  BRL: "Real Brasileiro",
  CAD: "Dólar Canadense",
  AUD: "Dólar Australiano",
  // Adicione mais moedas conforme necessário
};

document.addEventListener('DOMContentLoaded', () => {
  const fromCurrency = document.getElementById('fromCurrency');
  const toCurrency = document.getElementById('toCurrency');
  const amount = document.getElementById('amount');
  const exchangeRateElem = document.getElementById('exchangeRate');
  const convertedAmountElem = document.getElementById('convertedAmount');
  const exchangeChart = document.getElementById('exchangeChart');

  let chart;

  const populateCurrencyOptions = async () => {
    try {
      const response = await axios.get(apiUrl + 'USD');
      const currencies = Object.keys(response.data.conversion_rates);

      currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = `${currency} - ${currencyMap[currency] || 'Nome desconhecido'}`;
        fromCurrency.appendChild(option);
        toCurrency.appendChild(option.cloneNode(true));
      });

      fromCurrency.value = 'USD';
      toCurrency.value = 'EUR';
      convertCurrency();
    } catch (error) {
      console.error('Erro ao carregar moedas:', error);
    }
  };

  const convertCurrency = async () => {
    try {
      const from = fromCurrency.value;
      const to = toCurrency.value;
      const amountValue = amount.value;

      const response = await axios.get(apiUrl + from);
      const rate = response.data.conversion_rates[to];
      const convertedAmount = (amountValue * rate).toFixed(2);

      exchangeRateElem.textContent = `1 ${from} (${currencyMap[from]}) = ${rate} ${to} (${currencyMap[to]})`;
      convertedAmountElem.textContent = `${amountValue} ${from} (${currencyMap[from]}) = ${convertedAmount} ${to} (${currencyMap[to]})`;

      updateChart(from, to);
    } catch (error) {
      console.error('Erro ao converter moeda:', error);
    }
  };

  const updateChart = async (from, to) => {
    try {
      const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/history/${from}/${to}`);
      const history = response.data.conversion_rates;

      const labels = Object.keys(history);
      const data = labels.map(date => history[date]);

      if (chart) {
        chart.destroy();
      }

      chart = new Chart(exchangeChart, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: `Taxa de Câmbio de ${from} (${currencyMap[from]}) para ${to} (${currencyMap[to]})`,
            data,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Data'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Taxa de Câmbio'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
    }
  };

  fromCurrency.addEventListener('change', convertCurrency);
  toCurrency.addEventListener('change', convertCurrency);
  amount.addEventListener('input', convertCurrency);

  populateCurrencyOptions();
});
