let selectedCurrencyCode = "USD";

//INPUTS
const amountInput = document.getElementById('amount');
const rateInput = document.getElementById('rate');
const timeInput = document.getElementById('time');
const currencySelect = document.getElementById('currency');

//OUTPUTS
const monthlyOutput = document.getElementById('monthly');
const interestOutput = document.getElementById('interest');
const totalOutput = document.getElementById('total');

//=============================
//EXCHANGE RATES (ONLINE)
//=============================
let exchangeRates = {};

async function getRates() {
  try {
    const response = await
    fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    exchangeRates = data.rates;
    console.log('Rates Loaded');
    populateCurrencies(); //added upgrade
  } catch (error) {
    console.log('Offline mode');
    exchangeRates = {
      KES: 1,
      USD: 0.0077,
      EUR: 0.0066
    };

    populateCurrencies(); //added uprade
  }
}

getRates();

//SUPER UPGRADE
    const currencyNames = {
      USD: "US Dollar",
      EUR: "Euro",
      KES: "Kenyan Shilling",
      GBP: "British Pound",
      JPY: "Japanese Yen",
      INR: "Indian Rupee",
      AUD: "Australian Dollar",
      CAD: "Canadian Dollar",
      CHF: "Swiss Franc",
      CNY: "Chinese Yuan",
      AED: "UAE Dirham",
      KWD: "Kuwaiti Dinar",
      SAR: "Saudi Riyal",
      ZAR: "South African Rand"
    };
/*
    //===================================================
    //FLAGS
    const popularCurrencies = ["KES", "USD", "EUR", "GBP", "KWD"];

const currencyFlags = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  KES: "🇰🇪",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  INR: "🇮🇳",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  AED: "🇦🇪",
  KWD: "🇰🇼",
  SAR: "🇸🇦",
  ZAR: "🇿🇦"
};
//=======================================================
*/

/*
function populateCurrencies() {
  const list = document.getElementById("currencyList");
  list.innerHTML = "";

  let codes = Object.keys(exchangeRates);

  // ⭐ Move popular to top
  codes.sort((a, b) => {
    return (popularCurrencies.includes(b) ? 1 : 0) -
           (popularCurrencies.includes(a) ? 1 : 0);
  });

  codes.forEach(code => {
    let name = currencyNames[code] || code;
    let flag = currencyFlags[code] || "🌍";

    let div = document.createElement("div");
    div.className = "item";
    div.textContent = `${flag} ${code} - ${name}`;

    div.onclick = () => {
      selectedCurrencyCode = code;
      document.getElementById("selectedCurrency").innerText = div.textContent;
      calculateLoan();
    };

    list.appendChild(div);
  });
}

document.getElementById("searchCurrency").addEventListener("input", function () {
  let search = this.value.toLowerCase();
  let items = document.querySelectorAll(".item");

  items.forEach(item => {
    if (item.textContent.toLowerCase().includes(search)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});
*/
//AUTOPOPULATE CURRENCY LIST
function populateCurrencies() {
  currencySelect.innerHTML = '';

  for (let code in exchangeRates) {
    let option = document.createElement('option');
    option.value = code;
    let name = currencyNames[code] || code;
    option.textContent = code + ' - ' + name;
    currencySelect.appendChild(option);
  }

  currencySelect.value = 'USD'; //default

  // somewhere to be put....option.textContent = code + 'Currency';
}

//=========================
//ANIMATION FUNCTION
//=========================
function animateValue (element, start, end, duration, currency = ' ') {
  let startTime = null;

  function animation (currentTime) {
    if (!startTime) startTime = currentTime;

    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = start + (end - start) * progress;

    element.innerText = currency + ' ' + value.toFixed(2);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

//======================
//MAIN CALCULATION
//======================
function calculateLoan () {
  let P = parseFloat(amountInput.value);
  let annualRate = parseFloat(rateInput.value);
  let n = parseFloat(timeInput.value);
  //let selectedCurrency = selectedCurrencyCode;
  let selectedCurrency = currencySelect.value;

  if (!P || !annualRate || !n) {
    monthlyOutput.innerText = '0';
    interestOutput.innerText = '0';
    totalOutput.innerText = '0';
    return;
  }

  //convert annual rate to monthly
  let r = annualRate / 100 / 12;

  //=======CORE FORMULA (BASE CURRENCY - USD)======//
  let monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  let total = monthly * n;
  let interest = total - P;

  //======CONVERT RESULTS ONLY======//
  let rate = exchangeRates[selectedCurrency] || 1;

  let convertedMonthly = monthly * rate;
  let convertedTotal = total * rate;
  let convertedInterest = interest * rate;

  //======ANIMATED OUTPUT===========//
  animateValue(monthlyOutput, 0, convertedMonthly, 600, selectedCurrency);
  animateValue(interestOutput, 0, convertedInterest, 600, selectedCurrency);
  animateValue(totalOutput, 0, convertedTotal, 600, selectedCurrency);
}

//===================
//LIVE EVENTS
//===================
amountInput.addEventListener('input', calculateLoan);
rateInput.addEventListener('input', calculateLoan);
timeInput.addEventListener('input', calculateLoan);
currencySelect.addEventListener('change', calculateLoan);