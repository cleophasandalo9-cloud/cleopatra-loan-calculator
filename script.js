
  //===========================================
//APP STATE MODULE
//===========================================
let isSyncing = false;
let selectedCurrencyCode = "USD";
let exchangeRates = {};



//===========================================
//DOM REFERENCES MODULE
//===========================================
//>>>>>>>>>>>>>>>>>>>>>>>>>>
// INPUTS
//>>>>>>>>>>>>>>>>>>>>>>>>>>
const amountInput = document.getElementById('amount');
const rateInput = document.getElementById('rate');
const timeInput = document.getElementById('time');
const currencySelect = document.getElementById('currency');

//>>>>>>>>>>>>>>>>>>>>>>>>>>
// OUTPUTS
//>>>>>>>>>>>>>>>>>>>>>>>>>>
const monthlyOutput = document.getElementById('monthly');
const interestOutput = document.getElementById('interest');
const totalOutput = document.getElementById('total');


//>>>>>>>>>>>>>>>>>>>>>>>>
//ERROR ELEMENTS
//>>>>>>>>>>>>>>>>>>>>>>>>
const amountError = document.getElementById('amountError');
const rateError = document.getElementById('rateError');
const timeError = document.getElementById('timeError');





//============================================
//UTILITIES
//============================================
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//NUMBER FORMAT
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function formatNumber (value, apiCurrency) {
  const cleanCurrency = typeof apiCurrency === 'string' ? apiCurrency.trim().toUpperCase() : '';

  const isValidCurrency = cleanCurrency && Intl.supportedValuesOf('currency').includes(cleanCurrency);

  const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: isValidCurrency ? 'currency' : 'decimal'
  };

  if (isValidCurrency) {
    options.currency = cleanCurrency;
  }

  return new Intl.NumberFormat(`en-US`, options).format(value);

}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//DEBOUNCE FUNCTION
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//ANIMATION FUNCTION
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//FORMATS INPUTS
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function formatInput(input) {
  let value = input.value.replace(/,/g,'');
  if (!isNaN(value) && value !== '') {
    input.value = parseFloat(value).toLocaleString('en-US');
  }
}



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//SECTION NAVIGATION HELPER
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function showSection (sectionId) {
  const allSections = [
    'dashboardSection',
    'amortizationSection',
    'emiChartSection',
    'paymentScheduleSection',
  ];

  allSections.forEach(id => {
    const el = document.getElementById(id);
    if(el)el.style.display = 'none';
  });

  document.getElementById(sectionId).style.display = 'block';
  sidebar.classList.remove('active');
}




//==============================================
//CONFIGURATION / STATIC DATA
//==============================================
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//FALLBACK CURRENCIES
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CURRENCY NAMES
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
  


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CURRENCY FLAGS
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
  
  const currentValue = select.value;

  select.innerHTML = '';


  for (let code in exchangeRates) {
    const name = currencyNames[code] || code;

    const fullText = `${code} - ${name}`.toLowerCase();

    if (fullText.includes(searchValue)) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${code} - ${name}`;

      select.appendChild(option);
    }
  }

  if ([...select.options].some(opt => opt.value === currentValue)) {
    select.value = currentValue;
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


[]
function saveInputs () {
//console.log('Saving inputs...');


  const loanAmount = document.getElementById('amount').value;
  const interestRate = document.getElementById('rate').value;
  const loanTerm = document.getElementById('time').value;

  localStorage.setItem('amount', loanAmount);
  localStorage.setItem('rate', interestRate);
  localStorage.setItem('time', loanTerm);
}






//=====================================
//LOAN INPUT SERVICE
//=====================================
function getLoanInputs () {

  return {
    amount: parseFloat(amountInput.value),
    rate: parseFloat(rateInput.value),
    months: parseFloat(timeInput.value),

    currency: currencySelect.value,
    interestType: interestType.value
  };
}



//=====================================
//VALIDATION SERVICE
//=====================================
function validateLoanInputs (data) {

  const errors = {};

  if (!data.amount || data.amount <= 0) {
    errors.amount = `This field is required!`;
  }

  if (!data.rate || data.rate <= 0) {
    errors.rate = `This field is required!`;
  }

  if (!data.months || data.months <= 0) {
    errors.time = `This field is required!`;
  }

  return {
    isValid: Object.keys(errors).length === 0, errors
  };

}


function renderValidationErrors (errors) {

  clearValidationErrors ();

  if (errors.amount) {
    amountError.textContent = errors.amount;
    amountError.style.opacity = `1`;
    amountError.style.height = `auto`;
    amountInput.classList.add(`input-error`);
  }

  if (errors.rate) {
    rateError.textContent = errors.rate;
    rateError.style.opacity = `1`;
    rateError.style.height = `auto`;
    rateInput.classList.add(`input-error`);
  }

  if (errors.time) {
    timeError.textContent = errors.time;
    timeError.style.opacity = `1`;
    timeError.style.height = `auto`;
    timeInput.classList.add(`input-error`);
  }
}


function clearValidationErrors () {

  amountError.textContent = '';
  rateError.textContent = '';
  timeError.textContent = '';

  amountInput.classList.remove('input-error');
  rateInput.classList.remove('input-error');
  timeInput.classList.remove('input-error');

  amountError.style.opacity = '0';
  rateError.style.opacity = '0';
  timeError.style.opacity = '0';

  amountError.style.height = '0';
  rateError.style.height = '0';
  timeError.style.height = '0';
}



//=======================================
//LOAN CALCULATION SERVICE
//=======================================
function calculateSimpleLoan (data) {

  const timeInYears = data.months / 12;

  const interest = data.amount * (data.rate / 100) * timeInYears;

  const total = data.amount + interest;
  const monthly = total / data.months;

  return {
    monthly,
    total,
    interest
  };
}


function calculateCompoundLoan (data) {

  const monthlyRate = data.rate / 100 / 12;
  const monthly = data.amount * (monthlyRate * Math.pow(1 + monthlyRate, data.months)) / (Math.pow(1 + monthlyRate, data.months) - 1);

  const total = monthly * data.months;
  const interest = total - data.amount;

  return {
    monthly,
    total,
    interest,
    monthlyRate
  };
}



//=====================================
//AMORTIZATION SERVICE
//=====================================
function generateAmortizationSchedule (data, loanResult) {

  const schedule = [];

  let balance = data.amount;
  const maxRows = Math.min (data.months, 120);

  for (let month = 1; month <= maxRows; month++) {

    const interestPayment = balance * loanResult.monthlyRate;
    const principalPayment = loanResult.monthly - interestPayment;

    balance -= principalPayment;

    if (balance < 0) {
      balance = 0;
    }

    schedule.push ({
      month,
      payment: loanResult.monthly,
      interest: interestPayment,
      principal: principalPayment,
      balance
    });
  }

  return schedule;
}


function renderAmortizationTable (schedule, currency) {

  const tableBody = document.querySelector(`#breakdownTable tbody`);

  tableBody.innerHTML = '';

  schedule.forEach(rowData => {

    const row = document.createElement('tr');

    row.innerHTML = `<td>${rowData.month}</td>
    <td>${formatNumber(rowData.payment, currency)}</td>
    <td>${formatNumber(rowData.interest, currency)}</td>
    <td>${formatNumber(rowData.principal, currency)}</td>
    <td>${formatNumber(rowData.balance, currency)}</td>`;

    tableBody.appendChild(row);
  });
}


function renderSimpleInterestMessage () {

  document.querySelector (`#breakdownTable tbody`).innerHTML = `<tr>
  <td colspan='5'>
  Breakdown not available for simple interest
  </td>
  </tr>`;
}




//======================================
//UI RENDERERS
//======================================
function renderLoanResults (result, currency) {

  animateValue (monthlyOutput, 0, result.monthly, 600, currency);

  animateValue (interestOutput, 0, result.interest, 600, currency);

  animateValue (totalOutput, 0, result.total, 600, currency);
}









//======================
//MAIN CALCULATION
//======================
function calculateLoan () {

  const loanData = getLoanInputs();
  const validation = validateLoanInputs(loanData);

  if (!validation.isValid) {
    renderValidationErrors(validation.errors);
    return;
  }

  clearValidationErrors();



  //let selectedCurrency = selectedCurrencyCode;
  let selectedCurrency = loanData.currency;


  const loanResult = loanData.interestType === 'simple' ? calculateSimpleLoan(loanData): calculateCompoundLoan(loanData);
  

  renderLoanResults(loanResult, loanData.currency);


  if (loanData.interestType === 'compound') {

    const schedule = generateAmortizationSchedule(loanData, loanResult);

    renderAmortizationTable(schedule, selectedCurrency);

  } else {

    renderSimpleInterestMessage();
  }

  
}


//================ TOGGLE LOGIC FOR HAMBURGER MENU ===============//
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', function () {
  sidebar.classList.toggle('active');
});



//=========================================
//EMI CHART MODULE
//=========================================
const emiChartBtn = document.getElementById('emiChartBtn');
const emiChartSection = document.getElementById('emiChartSection');
let emiChartInstance = null;

function renderEmiChart(schedule) {

  schedule = schedule.slice(0, 60);

  const labels = schedule.map(row => 'M' + row.month);
  const interestData = schedule.map(row => parseFloat(row.interest.toFixed(2)));
  const principalData = schedule.map(row => parseFloat(row.principal.toFixed(2)));

  const ctx = document.getElementById('emiChart').getContext('2d');

  if (emiChartInstance) {
    emiChartInstance.destroy();
  }

  emiChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Principal',
        data: principalData,
        backgroundColor: 'rgba(0, 200, 80, 0.7)'
      },
      {
        label: 'Interest',
        data: interestData,
        backgroundColor: 'rgba(0, 120, 255, 0.7)'
      }]
    },

    options: {
      responsive: true,
      barPercentage: 0.95,
      categoryPercentage: 0.8,
      scales: {
        x: {stacked: true, ticks: {color: 'white'}, grid: {color: 'rgba(255, 255, 255, 0.05)'}},
        y: {stacked: true, ticks: {color: 'white'}, grid: {color: 'rgba(255, 255, 255, 0.1)'}}
      },

      plugins: {
        legend: {labels: {color: 'white'}}
      }
    }
  });
}


emiChartBtn.addEventListener('click', function () {

  const loanData = getLoanInputs();
  const validation = validateLoanInputs(loanData);

  if (!validation.isValid || loanData.interestType === 'simple') {
    dashboardSection.style.display = 'none';
    amortizationSection.style.display = 'none';
    emiChartSection.style.display = 'block';
    
    document.getElementById('emiChart').style.display = 'none';
    document.getElementById('emiSimpleMsg').style.display = 'block';

    sidebar.classList.remove('active');
    return;
  } else if (validation.isValid || loanData.interestType === 'compound') {

  const loanResult = calculateCompoundLoan(loanData);
  const schedule = generateAmortizationSchedule(loanData, loanResult);


  showSection('emiChartSection');

  document.getElementById('emiChart').style.display = 'block';
  document.getElementById('emiSimpleMsg').style.display = 'none';

  renderEmiChart(schedule);

  }
});




//===================================================
//PAYMENT SCHEDULE EXPORT MODULE
//===================================================
const exportScheduleBtn = document.getElementById('exportScheduleBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');

function generateCSV(schedule, currency) {
  //Header row
  const headers = ['Month', 'Payment', 'Interest', 'Principal', 'Balance'];

  const rows = schedule.map(row => [
    row.month,
    row.payment.toFixed(2),
    row.interest.toFixed(2),
    row.principal.toFixed(2),
    row.balance.toFixed(2),
  ]);

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

  return csvContent;
}


function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

exportScheduleBtn.addEventListener('click', function () {
  const loanData = getLoanInputs();
  const validation = validateLoanInputs(loanData);

  const exportMsg = document.getElementById('exportMsg');

  if(!validation.isValid || loanData.interestType === 'simple') {
    exportMsg.style.display = 'block';
    downloadCsvBtn.style.display = 'none';
    showSection('paymentScheduleSection');
    return;
  } else if (validation.isValid || loanData.interestType === 'compound') {
    exportMsg.style.display = 'none';
    downloadCsvBtn.style.display = 'block';
    showSection('paymentScheduleSection');
  }
});

downloadCsvBtn.addEventListener('click', function () {
  const loanData = getLoanInputs();
  const loanResult = calculateCompoundLoan(loanData);
  const schedule = generateAmortizationSchedule(loanData, loanResult);

  const csv = generateCSV(schedule, loanData.currency);
  const filename = `loan_schedule_${loanData.currency}_${loanData.amount}.csv`;

  downloadCSV(csv, filename);
});


//NAVIGATION LOGIC TO AMORTIZATION TABLE
const dashboardBtn = document.getElementById('dashboardBtn');

document.addEventListener('click', function (e) {
  if (
    sidebar.classList.contains('active') && !sidebar.contains(e.target) && !e.target.closest('.menu-toggle')
  ) {
    sidebar.classList.remove('active');
  }
});

const amortizationBtn = document.getElementById('amortizationBtn');

const dashboardSection = document.getElementById('dashboardSection');
const amortizationSection = document.getElementById('amortizationSection');

//SWITCH VIEWS
dashboardBtn.addEventListener('click', function () {
  showSection('dashboardSection');
});

//EVENT LISTENERS
amortizationBtn.addEventListener('click', function () {

  //Generate table first
  if (document.getElementById('amount').value) {
    calculateLoan();
  }

  showSection('amortizationSection');
});
//================================================================//





//======================================
//APP INITIALIZATION
//======================================
//>>>>>>>>>>>>>>>>>>>>>>>>>>>
//LOAD SAVED INPUTS
//>>>>>>>>>>>>>>>>>>>>>>>>>>>
function loadSavedInputs () {

  const loanAmount = localStorage.getItem('amount');
  const interestRate = localStorage.getItem('rate');
  const loanTerm = localStorage.getItem('time');

  if (loanAmount) amountInput.value = loanAmount;
  if (interestRate) rateInput.value = interestRate;
  if (loanTerm) timeInput.value = loanTerm;
}

function bindStorageEvents () {

  amountInput.addEventListener('input', saveInputs);
  rateInput.addEventListener('input', saveInputs);
  timeInput.addEventListener('input', saveInputs);
}

function initApp () {

  loadSavedInputs ();
  getRates();
  calculateLoan();

}













//===================
//LIVE EVENTS
//===================
amountInput.addEventListener('input', function () {
  formatInput(this);
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
document.getElementById('currencySearch').addEventListener('input', debounce(()=> filterCurrencies('currencySearch', 'currency'), 200));

//Converter search
document.getElementById('fromSearch').addEventListener('input', debounce(() => filterCurrencies('fromSearch', 'fromCurrency'), 200));
document.getElementById('toSearch').addEventListener('input', debounce(() => filterCurrencies('toSearch', 'toCurrency'), 200));

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


document.addEventListener('DOMContentLoaded', initApp);

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