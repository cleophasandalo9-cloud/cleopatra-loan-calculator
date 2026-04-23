let selectedCurrencyCode = "USD";

//<FORMATING FUNCTION>//
function formatNumber (value, currency = '') {
  return new Intl.NumberFormat('en-US', {
    style: currency? 'currency' : 'decimal',
    currency: currency || undefined,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}


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
    populateConverterCurrencies(); //added upgrade
  } catch (error) {
    console.log('Offline mode');
    exchangeRates = {
      //KES: 129.1447,
      //USD: 1,
      //EUR: 0.8543
    };

    populateCurrencies(); //added upgrade
    populateConverterCurrencies(); //added uprade
  }
}

getRates();


//<FORMATS INPUT AS USER TYPES>//
function formatInput(input) {
  let value = input.value.replace(/,/g,'');
  if (!isNaN(value) && value !== '') {
    input.value = parseFloat(value).toLocaleString('en-US');
  }
}

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
      ZAR: "South African Rand",
      AFN: "Afghan Afghani",
      ALL: "Albanian Lek",
      /*
      AMD: "",  ANG: "",  AOA: "", ARS: "", AWG: "",  AZN: "",
      BAM: "",  BBD: "", BDT: "",  BGN: "",  BHD: "",  BIF: "",
      BMD: "",  BND: "",  BOB: "", BRL: "",  BSD: "", BTN: "",
      BWP: "",  BYN: "",
      BZD: "",
      CDF: "",
      CLF: "",
      CLP: "",
      CNH: "",
      COP: "",
      CRD: "",
      CUP: "",
      CVE: "",
      CZK: "",
      DJF: "",
      DKK: "",
      DOP: "",
      DZD: "",
      EGP: "",
      ERN: "",
      ETB: "",
      FJD: "",
      FKP: "",
      FOK: "",
      GEL: "",
      GGP: "",
      GHS: "",
      GIP: "",
      GMD: "",
      GNF: "",
      GTB: "",
      GYD: "",
      HKD: "",
      HNL: "",
      HRK: "",
      HTG: "",
      HUF: "",
      IDR: "",
      ILS: "",
      IMP: "",
      IQD: "",
      IRR: "",
      ISK: "",
      JEP: "",
      JMD: "",
      JOD: "",
      KGS: "",
      KHR: "",
      KID: "",
      KMF: "",
      KYD: "",
      KZT: "",
      LAK: "",
      LBP: "",
      LKR: "",
      LYD: "",
      MAD: "",
      MDL: "",
      MGA: "",
      MKD: "",
      MMK: "",
      MNT: "",
      MOP: "",
      MRU: "",
      MVR: "",
      MWK: "",
      MYR: "",
      MZN: "",
      NAD: "",
      NGN: "",
      NIO: "",
      NOK: "",
      NPR: "",
      NZD: "",
      OMR: "",
      PAB: "",
      PEN: "",
      PGK: "",
      PHP: "",
      PKR: "",
      PLN: "",
      PYG: "",
      QAR: "",
      RON: "",
      RSD: "",
      RUB: "",
      RWF: "",
      SBD: "",
      SCR: "",
      SDG: "",
      SEK: "",
      SGD: "",
      SHP: "",
      SLE: "",
      SLL: "",
      SOS: "",
      SRD: "",
      SSP: "",
      STN: "",
      SYP: "",
      SZL: "",
      THB: "",
      TJS: "",
      TMT: "",
      TND: "",
      TOP: "",
      TRY: "",
      TTD: "",
      TVD: "",
      TWD: "",
      TZS: "",
      UAH: "",
      UGX: "",
      UYU: "",
      UZS: "",
      VES: "",
      VND: "",
      VUV: "",
      WST: "",
      XAF: "",
      XCD: "",
      XCG: "",
      XDR: "",
      XOF: "",
      XPF: "",
      YER: "",
      ZMW: "",
      ZWG: "",
      ZWL: "",
      */

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

//CURRENCY SYMBOL
/*
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'Ksh',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    ZAR: 'R'
  }
*/
function filterCurrencies (searchInputId, selectId) {
  const searchValue = document.getElementById(searchInputId).value.toLowerCase();
  const select = document.getElementById(selectId);
  const options = select.options;

  for (let i = 0; i < options.length; i++) {
    let text = options[i].text.toLowerCase();

    if (text.includes(searchValue)) {
      options[i].style.display = '';
    } else {
      options[i].style.display = 'none';
    }
  }
}
//======================================
//CONVERTER CURRENCY
//======================================
//TOGGLE FUNCTION

function toggleConverter () {
  const panel = document.getElementById('converterPanel');
  const overlay = document.getElementById('overlay');

  panel.classList.toggle('active');
  overlay.classList.toggle('active');
  /*if (panel.style.display === 'block') {
    panel.style.display = 'none';
  } else {
    panel.style.display = 'block';
  }
    */
}

//CONNECT DROPDOWNS TO API
function populateConverterCurrencies () {
  const from = document.getElementById('fromCurrency');
  const to = document.getElementById('toCurrency');

  from.innerHTML = '';
  to.innerHTML = '';

  for (let code in exchangeRates) {
    let option1 = document.createElement('option');
    option1.value = code;
    option1.textContent = code;

    let option2 = document.createElement('option');
    option2.value = code;
    option2.textContent = code;

    from.appendChild(option1);
    to.appendChild(option2);
  }

  from.value = currencySelect.value;
  to.value = currencySelect.value;
}

//CONVERSION LOGIC
function convertCurrency () {
  const amount = parseFloat(document.getElementById('convertAmount').value);
  const from = document.getElementById('fromCurrency').value;
  const to = document.getElementById('toCurrency').value;
  const result = document.getElementById('convertResult');

  if (!amount || isNaN(amount)) {
    result.innerText = '0';
    return
  }
/*
  let rateFrom = exchangeRates[from];
  let rateTo = exchangeRates[to];

  let converted = (amount / rateFrom) * rateTo;

  result.innerText = to + ' ' + converted.toFixed(2);
*/

  let converted;
  if (Object.keys(exchangeRates).length === 0) {
    //OFFLINE MODE 'n no conversion
    converted = amount;

  } else {
    let rateFrom = exchangeRates[from];
    let rateTo = exchangeRates[to];

    converted = (amount / rateFrom) * rateTo;
  }

  result.innerText = `${to} ${converted.toFixed(2)}`;
}

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

    element.innerText = formatNumber(value, currency);

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
  //Get inputs
  //const amountInput = document.getElementById('amount');
  //const rateInput = document.getElementById('interest');
  //const timeInput = document/getElementById('time');

  //Error elements
  const amountError = document.getElementById('amountError');
  const interestError = document.getElementById('interestError');
  const yearsError = document.getElementById('yearsError');

  //Reset errors
  //amountError.textContent = "";
  interestError.textContent = "";
  yearsError.textContent = "";

  amountInput.classList.remove('input-error');
  rateInput.classList.remove('input-error');
  timeInput.classList.remove('input-error');


  let hasError = false;

  //Validate amount
  if (amountInput.value === '' || parseFloat(amountInput.value) <= 0) {
    amountError.textContent = 'This field is required!';
    amountError.style.opacity = '1';
    amountError.style.height = 'auto';
    amountInput.classList.add('input-error');
    amountError.style.border = '1px solid transparent';
    hasError = true;
  }

  //Validate interest
  if (rateInput.value === '' || parseFloat(rateInput.value) <= 0) {
    interestError.textContent = 'This field is required!';
    interestError.style.opacity = '1';
    interestError.style.height = 'auto';
    rateInput.classList.add('input-error');
    interestError.style.border = '1px solid transparent'
    hasError = true;
  }

  //Validate years
  if (timeInput.value === '' || parseFloat(timeInput.value) <= 0) {
    yearsError.textContent = 'This field is required!';
    yearsError.style.opacity = '1';
    yearsError.style.height = 'auto';
    timeInput.classList.add('input-error');
    yearsError.style.border = '1px solid transparent';
    hasError = true;
  }

  if (hasError) return;

  let P = parseFloat(amountInput.value);
  let annualRate = parseFloat(rateInput.value);
  let n = parseFloat(timeInput.value);
  let type = document.getElementById('interestType').value;

  if (isNaN(P) || isNaN(annualRate) || isNaN(n)) {
    return;
  }
  //let selectedCurrency = selectedCurrencyCode;
  let selectedCurrency = currencySelect.value;

  if (!P || !annualRate || !n) {
    monthlyOutput.innerText = '0';
    interestOutput.innerText = '0';
    totalOutput.innerText = '0';
    return;
  }

  //====================================
  //SWITCH BETWEEN COMPOUND OR SIMPLE
  //====================================
  let monthly, total, interest, r;

  if (type === 'simple') {
    //SIMPLE INTEREST
    let t = n / 12;
    interest = P * (annualRate / 100) * t;
    total = P + interest;
    monthly =total / 12;

  } else {
    //COMPOUND INTEREST
    let r = annualRate / 100 / 12;

    monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    total = monthly * n;
    interest = total - P;
  }
/*
  //convert annual rate to monthly
  let r = annualRate / 100 / 12;

  //=======CORE FORMULA (BASE CURRENCY - USD)======//
  let monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  let total = monthly * n;
  let interest = total - P;
*/

  // =====================
  // AMORTIZATION TABLE
  // =====================

  let exchangeRate = 1; //Added upgrade
  //let exchangeRate = exchangeRates[selectedCurrency] || 1;
  if (type === 'compound') {
    let r = annualRate / 100 / 12
    
  
    const tableBody = document.querySelector('#breakdownTable tbody');

    // clear previous rows
    tableBody.innerHTML = "";

    // monthly rate already calculated as r
    let balance = P;

    // limit rows (performance)
    let maxRows = Math.min(n, 12); // show only 24 months

    for (let i = 1; i <= maxRows; i++) {

      let interestPayment = balance * r;
      let principalPayment = monthly - interestPayment;

      balance -= principalPayment;

      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${i}</td>
        <td>${formatNumber(monthly, selectedCurrency)}</td>
        <td>${formatNumber(interestPayment, selectedCurrency)}</td>
        <td>${formatNumber(principalPayment, selectedCurrency)}</td>
        <td>${balance > 0 ? formatNumber(balance, selectedCurrency) : formatNumber(0, selectedCurrency)}</td>
      `;

      tableBody.appendChild(row);
    }

  } else {
    document.querySelector('#breakdownTable tbody').innerHTML = `<tr><td colspan = '5'>Breakdown not available for simple interest</td></tr>`;
  }

  //======CONVERT RESULTS ONLY======//
  

  let convertedMonthly = monthly;
  let convertedTotal = total;
  let convertedInterest = interest;

  //let convertedMonthly = monthly * exchangeRate;
  //let convertedTotal = total * exchangeRate;
  //let convertedInterest = interest * exchangeRate;

  //======ANIMATED OUTPUT===========//
  animateValue(monthlyOutput, 0, convertedMonthly, 600, selectedCurrency);
  animateValue(interestOutput, 0, convertedInterest, 600, selectedCurrency);
  animateValue(totalOutput, 0, convertedTotal, 600, selectedCurrency);

  
  console.log(type);
  return;

}

//===================
//LIVE EVENTS
//===================
amountInput.addEventListener('input', calculateLoan);
rateInput.addEventListener('input', calculateLoan);
timeInput.addEventListener('input', calculateLoan);
currencySelect.addEventListener('change', calculateLoan);

const convertAmountInput = document.getElementById('convertAmount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');

convertAmountInput.addEventListener('input', convertCurrency);
fromCurrencySelect.addEventListener('change', convertCurrency);
toCurrencySelect.addEventListener('change', convertCurrency);

//simple/compound interest
const interestType = document.getElementById('interestType');
interestType.addEventListener('change', calculateLoan);

//Loan Calculator search
document.getElementById('currencySearch').addEventListener('input', () => filterCurrencies('currencySearch', 'currency'));

//Converter search
document.getElementById('fromSearch').addEventListener('input', () => filterCurrencies('fromSearch', 'fromCurrency'));
document.getElementById('toSearch').addEventListener('input', () => filterCurrencies('toSearch', 'toCurrency'));

//REMOVE ERROR WHEN USER TYPES
const inputs = document.querySelectorAll('#amount, #rate, #time');

inputs.forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('input-error');

    const error = document.getElementById(input.id + 'Error');

    if (error) {
      error.textContent = "";
      error.style.opacity = "0";
      error.style.height = "0";
    }
  });
});