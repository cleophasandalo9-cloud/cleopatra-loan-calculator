//prevent infinite loop
let isSyncing = false;

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

/*
window.onlanguagechange = function () {
  const loanAmount = localStorage.getItem('amount');
  const interestRate = localStorage.getItem('rate');
  const loanTerm = localStorage.getItem('time');

  if (loanAmount) document.getElementById('amount').value = loanAmount;
  if (interestRate) document.getElementById('rate').value = interestRate;
  if (loanTerm) document.getElementById('time').value = loanTerm;
};
*/

//====================================
//STORING OF USER INPUTS
//====================================
document.addEventListener('DOMContentLoaded', function () {
  const loanAmount = localStorage.getItem('amount');
  const interestRate = localStorage.getItem('rate');
  const loanTerm = localStorage.getItem('time');

  if (loanAmount) document.getElementById('amount').value = loanAmount;
  if (interestRate) document.getElementById('rate').value = interestRate;
  if (loanTerm) document.getElementById('time').value = loanTerm;

  calculateLoan(); // auto update results
});


/*/<UPGRADE: THEME TOGGLE FUNCTION>//
function toggleTheme () {
  const body = document.body;
  const toggle =document.querySelector('.theme-toggle');

  body.classList.toggle('dark-mode');

  //save preference
  if (body.classList.contains('dark-mode')) {
    toggle.textContent = '☀';
    localStorage.setItem('theme', 'dark')
  } else {
    toggle.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
};

//UPGRADE: LOAD SAVED THEME ON PAGE
window.onload = function () {
  const savedTheme = localStorage.getItem('theme');
  const toggle = document.querySelector('.theme-toggle');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (toggle) toggle.textContent = '☀';
  } else {
    if (toggle) toggle.textContent = '🌙';
  }
};
*/

//INPUTS
const amountInput = document.getElementById('amount');
const rateInput = document.getElementById('rate');
const timeInput = document.getElementById('time');
const currencySelect = document.getElementById('currency');

//OUTPUTS
const monthlyOutput = document.getElementById('monthly');
const interestOutput = document.getElementById('interest');
const totalOutput = document.getElementById('total');

//=========================================================
//DEBOUNCE FUNCTION
//Debounce means; waits until the
//user stops typing, then run the function once
//=========================================================
function debounce (func, delay) {
  let timeout;

  return function (...args) {

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const debouncedCalculate = debounce (function () {
  calculateLoan();
  convertCurrency();
  saveInputs();
}, 400);



//=============================
//EXCHANGE RATES (ONLINE)
//=============================
let exchangeRates = {};

//================================================
//OFFLINE FALLBACK CURRENCIES
//================================================
const fallbackRates = {
  USD: 1,
  EUR: 0.85,
  KES: 129.0846,
  GBP: 0.75,
  JPY: 150,
  INR: 83,
  AUD: 1.5,
  CAD: 1.35,
  CHF: 0.9,
  CNY: 7.2,
  AED: 3.67,
  SAR: 3.75,
  ZAR: 18,
  NGN: 1500,
  GHS: 12,
  UGX: 3800,
  TZS: 2500,
  EGP: 48,
  TRY: 32,
  BRL: 5
};

async function getRates() {
  try {
    const response = await
    fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    exchangeRates = data.rates;
    console.log('Online mode 😎 \nRates Loaded');
    populateCurrencies(); //added upgrade
    populateConverterCurrencies(); //added upgrade
  } catch (error) {
    console.log('Offline mode 👾👾😁 \nNo rates loaded');
    
    //alert("You're offline. Using limited currency data.")
    exchangeRates = fallbackRates;

    populateCurrencies(); //added upgrade
    populateConverterCurrencies(); //added uprade
  }
}
document.addEventListener('DOMContentLoaded', function () {
getRates();
});



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
      EGP: "Egyptian Pound",
      JPY: "Japanese Yen",
      INR: "Indian Rupee",
      AUD: "Australian Dollar",
      CAD: "Canadian Dollar",
      CHF: "Swiss Franc",
      CNY: "Chinese Yuan",
      AED: "UAE Dirham",
      BRL: "Brazilian Real",
      KWD: "Kuwaiti Dinar",
      SAR: "Saudi Riyal",
      ZAR: "South African Rand",
      AFN: "Afghan Afghani",
      ALL: "Albanian Lek",
      NGN: "Nigerian Naira",
      GHS: "Ghanaian Cedi",
      UGX: "Ugandan Shilling",
      TZS: "Tanzanian Shilling",
      TRY: "Turkish Lira",
      KWD: "Kuwaiti Dinar",
      AMD: "Armenian Dram",
      ANG: "Neth Antilles Guilder",
      AOA: "Angolan Kwanza",
      ARS: "Agentine Peso",
      AWG: "Aruba Florin",
      AZN: "Azerbaijani Manat",
      BAM: "Bosnian Concertible Mark",
      BBD: "Barbados Dollar",
      BDT: "Bangladeshi Taka",
      BGN: "Bulgarian Lev",
      BHD: "Bahraini Dinar",
      BIF: "Burundian Franc",
      BMD: "Bermuda Dollar",
      BND: "Brunei Dollar",
      BOB: "Bolivian Boliviano",
      BSD: "Bahamian Dollar",
      BTN: "Bhutan Ngultrum",
      BWP: "Botswana Pula",
      BYN: "Bhutan Ngultrum",
      BZD: "Belize Dollar",
      CDF: "Congolese Franc",
      CLP: "Chilean Peso",
      CNH: "RMB Offshore",
      COP: "Colombian Peso",
      CRC: "Costa Rican Colón",
      CUP: "Cuban Peso",
      CVE: "Cape Verde Escudo",
      CZK: "Czech Koruna",
      DJF: "Djiboutian Franc",
      DKK: "Dansih Krone",
      DOP: "Dominican Peso",
      DZD: "Algerian Dinar",
      ERN: "Eritrea Nakfa",
      ETB: "Ethiopian Birr",
      FJD: "Fiji Dollar",
      FKP: "Falkland Islands Pound",
      FOK: "Faroese Króna",
      GEL: "Georgian Lari",
      GGP: "Guernsey Pound",
      GIP: "Gibraltar Pound",
      GMD: "Gambian Dalasi",
      GNF: "Guinean Franc",
      GYD: "Guyana Dollar",
      HKD: "Hong Kong Dollar",
      HNL: "Honduras Lempira",
      HRK: "Croatian Kuna",
      HTG: "Haitian Gourde",
      HUF: "Hungarian Forint",
      IDR: "Indonesian Rupiah",
      ILS: "Israel Shekel",
      IMP: "Manx Pound",
      IQD: "Iraqi Dinar",
      IRR: "Iranian Rial",
      ISK: "Iceland Krona",
      JEP: "Jersy Pound",
      JMD: "Jamaican Dollar",
      JOD: "Jordanian Dinar",
      KGS: "Kyrgyzstani Som",
      KHR: "Cambodian Riel",
      KID: "Kiribati Dollar",
      KMF: "Comorian Franc",
      KYD: "Cayman Islands Dollar",
      KZT: "Kazakhstani Tenge",
      LAK: "Lao Kip",
      LBP: "Lebanese Pound",
      LKR: "Sri Lankan Rupee",
      LYD: "Libyan Dinar",
      MAD: "Moroccan Dirham",
      MDL: "Moldovan Leu",
      MGA: "Malagasy Ariary",
      MKD: "Macedonian Denar",
      MMK: "Myanmar Kyat",
      MNT: "Mongolian Tugrik",
      MOP: "Macau Pataca",
      MRU: "Mauritanian Ougulya",
      MVR: "Maldives Rufiyaa",
      MWK: "Malawian Kwacha",
      MYR: "Malaysian Ringgit",
      MZN: "Mozambican Metical",
      NAD: "Namibian Dollar",
      NIO: "Nicaragua Cordoba",
      NOK: "Norwegian Krone",
      NPR: "Nepalese Rupee",
      NZD: "New Zealand Dollar",
      OMR: "Omani Rial",
      PAB: "Panamanian Balboa",
      PEN: "Peruvian Sol",
      PGK: "Papua New Guinea Kina",
      PHP: "Philippine Peso",
      PKR: "Pakistani Rupee",
      PLN: "Polish Zloty",
      PYG: "Paraguayan Guaraní",
      QAR: "Qatari Riyal",
      RON: "Romanian New Leu",
      RSD: "Serbain Dinars",
      RUB: "Russian Ruble",
      RWF: "Rwanda Franc",
      SBD: "Solomon Islands Dollar",
      SCR: "Seychellois Rupee",
      SDG: "Sudanese Pound",
      SEK: "Sweedish Krona",
      SGD: "Singapore Dollar",
      SHP: "St Helena Pound",
      SLE: "Sierra Leonean Leone",
      SLL: "Sierra Leonean Leone",
      SOS: "Somali Shilling",
      SRD: "Surinam Florin",
      SSP: "South Sudanese Pound",
      STN: "Sao Tomean Dobras",
      SYP: "Syrian Pound",
      SZL: "Swaziland Lilageni",
      THB: "Thai Baht",
      TJS: "Tajikistani Somoni",
      TMT: "Turkmenistani Manat",
      TND: "Tunisian Dinar",
      TOP: "Tonga Pa'ang",
      TTD: "Trinidad&Tobago Dollar",
      TVD: "Tavaluan Dollar",
      TWD: "Taiwan Dollar",
      UAH: "Ukrainian Hryvnia",
      UYU: "Uruguayan New Peso",
      UZS: "Uzbekistani Som",
      VES: "Venezuelan Bolívar",
      VND: "Vietnamese Dong",
      VUV: "Vanuatu Vatu",
      WST: "Samoa Tala",
      XAF: "CFA Franc (CEMAC)",
      XCD: "East Caribbean Dollar",
      XCG: "Caribbean Guilder",
      XOF: "CFA Franc (BCEAO)",
      XPF: "Pacific Franc",
      YER: "Yemeni Rial",
      ZWL: "Zimbabwe Dollar",
      ZWG: "Zimbabwe Gold",
      ZMW: "Zambian Kwacha",
    };

    //=========================================
    //ADDING FLAG ICONS TO THE DROPDOWNS
    //=========================================
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
    console.log('Exchange Rates:', exchangeRates);
  const from = document.getElementById('fromCurrency');
  const to = document.getElementById('toCurrency');
  

  //stop if element is not found
  if (!from || !to) {
    console.log('Converter elements not found');
    return;
  }
  

  from.innerHTML = '';
  to.innerHTML = '';

  for (let code in exchangeRates) {
    let name = currencyNames[code] || code;

    let option1 = document.createElement('option');
    option1.value = code;
    option1.textContent = code + '-' + name;

    let option2 = document.createElement('option');
    option2.value = code;
    option2.textContent = code + '-' + name;

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
  if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
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

/*/====================================
//POPULATE CUSTOM DROPDOWN
//====================================
function populateCustomDropdown () {
  const list = document.getElementById('currencyList');
  const selected = document.getElementById('selectedCurrency');

  list.innerHTML = '';

  for (let code in exchangeRates) {
    const item = document.createElement('div');
    item.className = 'currency-item';

    let name = currencyNames[code] || code;
    let flag = currencyFlags[code] || '';

    item.textContent = `${flag} ${code} - ${name}`;

    item.addEventListener('click', function () {

      //Update visible UI
      selected.textContent = item.textContent;

      //Update REAL select (important)
      document.getElementById('currency').value = code;

      //Trigger existing logic
      calculateLoan();

      list.style.display = 'none';
    });

    list.appendChild(item)
  }
}
*/

/*=================================
//TOGGLE DROPDOWN
//=================================
document.getElementById('selectedCurrency').addEventListener('click', function () {
  const list = document.getElementById('currencyList');

  list.style.display = list.style.display === 'block' ? 'none': 'block';
});
*/

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

//========================
//SAVING USER INPUT
//========================
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('amount').addEventListener('input', saveInputs);

  document.getElementById('rate').addEventListener('input', saveInputs);

  document.getElementById('time').addEventListener('input', saveInputs);
});

function saveInputs () {
//console.log('Saving inputs...');


  const loanAmount = document.getElementById('amount').value;
  const interestRate = document.getElementById('rate').value;
  const loanTerm = document.getElementById('time').value;

  localStorage.setItem('amount', loanAmount);
  localStorage.setItem('rate', interestRate);
  localStorage.setItem('time', loanTerm);
} 

//======================
//MAIN CALCULATION
//======================
function calculateLoan () {

  //Error elements
  const amountError = document.getElementById('amountError');
  const interestError = document.getElementById('interestError');
  const yearsError = document.getElementById('yearsError');

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
    monthly =total / n;

  } else {
    //COMPOUND INTEREST
    let r = annualRate / 100 / 12;

    monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    total = monthly * n;
    interest = total - P;
  }

  // =====================
  // AMORTIZATION TABLE
  // =====================

  let exchangeRate = 1; //Added upgrade

  if (type === 'compound') {
    let r = annualRate / 100 / 12
    
  
    const tableBody = document.querySelector('#breakdownTable tbody');

    // clear previous rows
    tableBody.innerHTML = "";

    // monthly rate already calculated as r
    let balance = P;

    // limit rows (performance)
    let maxRows = Math.min(n, 120);
    for (let i = 1; i <= maxRows; i++) {

      let interestPayment = balance * r;
      let principalPayment = monthly - interestPayment;

      balance -= principalPayment;

      if (balance < 0) balance = 0;

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
document.querySelector('#breakdownTable tbody').innerHTML = `<tr>
        <td colspan = '5'>
        Breakdown not available for simple interest
        </td>
    </tr>`;
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

//================ TOGGLE LOGIC FOR HAMBURGER MENU ===============//
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', function () {
  sidebar.classList.toggle('active');
});

//NAVIGATION LOGIC TO AMORTIZATION TABLE
const dashboardBtn = document.getElementById('dashboardBtn');
const amortizationBtn = document.getElementById('amortizationBtn');

const dashboardSection = document.getElementById('dashboardSection');
const amortizationSection = document.getElementById('amortizationSection');

//SWITCH VIEWS
dashboardBtn.addEventListener('click', function () {
  dashboardSection.style.display = 'block';
  amortizationSection.style.display = 'none';

  sidebar.classList.remove('active'); // closes menu
});

//EVENT LISTENERS
amortizationBtn.addEventListener('click', function () {

  //Generate table first
  if (document.getElementById('amount').value) {
    calculateLoan();
  }

  //Then show section
  dashboardSection.style.display = 'none';
  amortizationSection.style.display = 'block';

  sidebar.classList.remove('active'); //close menu
});
//================================================================//

//===================
//LIVE EVENTS
//===================
amountInput.addEventListener('input', function () {
  if (isSyncing) return;

  isSyncing =true;

  //calculateLoan();

  //sync converter input********
  document.getElementById('convertAmount').value = this.value;
  //Recalculate conversion*******
  //convertCurrency();

  debouncedCalculate();

  isSyncing =false;
});


rateInput.addEventListener('input', debouncedCalculate);
timeInput.addEventListener('input', debouncedCalculate);


currencySelect.addEventListener('change', function () {
  if (isSyncing) return;

  isSyncing =true;

  const selected = currencySelect.value;

  //Converter dropdown
    const from = document.getElementById('fromCurrency');
    const to = document.getElementById('toCurrency');

    //Sore previous from
    const previousFrom = from.value;

    //SYNC FROM CURRENCY
    from.value = selected;

    //Only change 'to' if it was same before
    if (to.value === previousFrom) {
      to.value = selected === 'USD' ? 'KES':'USD';
    }

    calculateLoan();
    convertCurrency();

    isSyncing =false;
});

const convertAmountInput = document.getElementById('convertAmount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');

convertAmountInput.addEventListener('input', convertCurrency);

fromCurrencySelect.addEventListener('change', convertCurrency);

toCurrencySelect.addEventListener('change', function () {
  convertCurrency();

  //sync calculator currency
  currencySelect.value = this.value;

  //Recalculate loan
  calculateLoan();
});

//simple/compound interest
const interestType = document.getElementById('interestType');
interestType.addEventListener('change', calculateLoan);

//**************Loan Calculator search*****************
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

/*
function initApp() {
  getRates();
  calculateLoan();
  saveInputs();
  bindEvents();
}

function bindEvents() {

  amountInput.addEventListener('input', debouncedCalculate);
  rateInput.addEventListener('input', debouncedCalculate);
  timeInput.addEventListener('input', debouncedCalculate);

  currencySelect.addEventListener('change', debouncedCalculate);
}
*/