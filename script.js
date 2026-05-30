//===========================================
//APP STATE MODULE
//===========================================
let isSyncing = false;

let exchangeRates = {};
const animationFrames = {};

const POPULAR_CURRENCIES = ['USD', 'EUR', 'KES', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'AED', 'ZAR', 'NGN', 'KWD'];

const CDN_CHARTJS = 'https://cdn.jsdelivr.net/npm/chart.js';
const CDN_JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const CDN_AUTOTABLE = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';



//===========================================
//DOM REFERENCES MODULE
//===========================================

// INPUTS
let amountInput;
let rateInput;
let timeInput;
let currencySelect;
let interestType;

// OUTPUTS
let monthlyOutput;
let interestOutput;
let totalOutput;

// ERROR ELEMENTS
let amountError;
let rateError;
let timeError;

function initDOMReferences () {
  amountInput    = document.getElementById('amount');
  rateInput      = document.getElementById('rate');
  timeInput      = document.getElementById('time');
  currencySelect = document.getElementById('currency');
  interestType   = document.getElementById('interestType');

  monthlyOutput  = document.getElementById('monthly');
  interestOutput = document.getElementById('interest');
  totalOutput    = document.getElementById('total');

  amountError    = document.getElementById('amountError');
  rateError      = document.getElementById('rateError');
  timeError      = document.getElementById('timeError');

  bindInputEvents();
}




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


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// LAZY SCRIPT LOADER
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const loadedScripts = {};

function loadScript(url) {

  if (loadedScripts[url]) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script   = document.createElement('script');
    script.src     = url;
    script.async   = true;

    script.onload  = () => {
      loadedScripts[url] = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };

    document.head.appendChild(script);
  });
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
  const key = element.id;

  // Cancel any animation already running on this element
  if (animationFrames[key]) {
    cancelAnimationFrame(animationFrames[key]);
  }

  let startTime = null;

  function animation (currentTime) {
    if (!startTime) startTime = currentTime;

    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = start + (end - start) * progress;

    element.innerText = formatNumber(value, currency);

    if (progress < 1) {
      animationFrames[key] = requestAnimationFrame(animation);
    } else {
      delete animationFrames[key]; // clean up once done
    }
  }

  animationFrames[key] = requestAnimationFrame(animation);
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
    'loanComparisonSection',
    'savingsSection',
    'refinanceSection',
    'extraPaymentSection'
  ];

  allSections.forEach(id => {
    const el = document.getElementById(id);
    if(el)el.style.display = 'none';
  });

  document.getElementById(sectionId).style.display = 'block';
  sidebar.classList.remove('active');
  menuToggle.focus();
  sidebar.inert = true;
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
    BYN: "Belarusian Ruble",
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
  


//======================================
// RATE CACHE CONFIG
//======================================
const CACHE_KEY       = 'lc_exchange_rates';   // key we store rates under in localStorage
const CACHE_TS_KEY    = 'lc_rates_timestamp';  // key we store the fetch time under
const CACHE_TTL_MS    = 6 * 60 * 60 * 1000;   // 6 hours in milliseconds
const FETCH_TIMEOUT_MS = 5000;                  // abort fetch if no response in 5 seconds

//======================================
// GET RATES (with cache + timeout)
//======================================
async function getRates() {

  // ── STEP 1: Check cache ──────────────────────────────────────────
  // Read what we previously saved in localStorage
  const cachedRates = localStorage.getItem(CACHE_KEY);
  const cachedTime  = localStorage.getItem(CACHE_TS_KEY);

  const now = Date.now(); // current time in milliseconds since 1970 (standard JS timestamp)

  // If we have cached rates AND they are less than 6 hours old, use them and stop here
  if (cachedRates && cachedTime && (now - Number(cachedTime)) < CACHE_TTL_MS) {
    exchangeRates = JSON.parse(cachedRates); // JSON.parse converts the saved string back to an object
    console.log('Using cached rates 💾 (age: ' + Math.round((now - Number(cachedTime)) / 60000) + ' mins)');
    populateCurrencies();
    populateConverterCurrencies();
    return; // exit early — no API call needed
  }

  // ── STEP 2: Cache is missing or too old — fetch fresh rates ──────
  try {

    // AbortController lets us cancel the fetch if it takes too long
    // Without this, a slow network could leave the app hanging silently for 30+ seconds
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal  // attaches the abort signal to the fetch request
    });

    clearTimeout(timeoutId); // cancel the abort timer — fetch succeeded in time

    // Guard 1: HTTP-level failure (429 rate limit, 500 server error, etc.)
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // Guard 2: API returned 200 but payload is wrong or rates missing
    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid API payload');
    }

    exchangeRates = data.rates;

    // ── STEP 3: Save fresh rates to cache ────────────────────────────
    // JSON.stringify converts the rates object to a string so localStorage can store it
    // localStorage can only store strings — not objects or arrays directly
    localStorage.setItem(CACHE_KEY,    JSON.stringify(data.rates));
    localStorage.setItem(CACHE_TS_KEY, String(now)); // save current timestamp as string

    console.log('Online mode 😎 — fresh rates fetched and cached');
    populateCurrencies();
    populateConverterCurrencies();

  } catch (error) {

    // ── STEP 4: Fetch failed — try stale cache before hardcoded fallback ──
    // Even if the cache is expired, stale rates are better than fixed 2023 hardcoded values
    if (cachedRates) {
      exchangeRates = JSON.parse(cachedRates);
      console.warn('Fetch failed — using stale cache:', error.message);
    } else {
      exchangeRates = fallbackRates;
      console.warn('Fetch failed, no cache — using hardcoded fallback:', error.message);
    }

    populateCurrencies();
    populateConverterCurrencies();
  }
}




function filterCurrencies(searchInputId, selectId) {
  const searchValue = document.getElementById(searchInputId).value.toLowerCase().trim();
  const select      = document.getElementById(selectId);
  const currentValue = select.value;


  let firstVisible = null;

  Array.from(select.options).forEach(opt => {
    const text = opt.textContent.toLowerCase();
    const match = text.includes(searchValue);

    opt.hidden   = !match;
    opt.disabled = !match;

    if (match && !firstVisible) firstVisible = opt.value;
  });

  // Restore previous selection if it's still visible, else pick first visible
  const stillVisible = [...select.options].some(
    opt => opt.value === currentValue && !opt.hidden
  );

  select.value = stillVisible ? currentValue : (firstVisible || '');

  debouncedCalculate();
}


//======================================
//CONVERTER CURRENCY
//======================================
//TOGGLE FUNCTION

function toggleConverter () {
  const panel   = document.getElementById('converterPanel');
  const overlay = document.getElementById('overlay');
  const btn     = document.querySelector('[aria-controls="converterPanel"]');

  panel.classList.toggle('active');
  overlay.classList.toggle('active');


  const isOpen = panel.classList.contains('active');
  btn.setAttribute('aria-expanded', String(isOpen));
}

//CONNECT DROPDOWNS TO API
function populateConverterCurrencies() {
  const from = document.getElementById('fromCurrency');
  const to   = document.getElementById('toCurrency');

  if (!from || !to) { console.warn('Converter elements not found'); return; }

  // Build grouped options for a given <select>
  function buildGrouped(selectEl) {
    selectEl.innerHTML = '';

    const popularGroup = document.createElement('optgroup');
    popularGroup.label = '⭐ Popular';

    const allGroup = document.createElement('optgroup');
    allGroup.label = 'All Currencies';

    for (let code in exchangeRates) {
      const name = currencyNames[code] || code;
      const opt  = document.createElement('option');
      opt.value  = code;
      opt.textContent = `${code} - ${name}`;

      if (POPULAR_CURRENCIES.includes(code)) {
        popularGroup.appendChild(opt);
      } else {
        allGroup.appendChild(opt);
      }
    }

    selectEl.appendChild(popularGroup);
    selectEl.appendChild(allGroup);
  }

  buildGrouped(from);
  buildGrouped(to);

  from.value = currencySelect.value;
  to.value   = currencySelect.value;
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

  const popularGroup = document.createElement('optgroup');
  popularGroup.label = '⭐ Popular';

  const allGroup = document.createElement('optgroup');
  allGroup.label = 'All Currencies';

  for (let code in exchangeRates) {
    const name = currencyNames[code] || code;
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code} - ${name}`;

    if (POPULAR_CURRENCIES.includes(code)) {
      popularGroup.appendChild(option);
    } else {
      allGroup.appendChild(option);
    }
  }

  currencySelect.appendChild(popularGroup);
  currencySelect.appendChild(allGroup);
  currencySelect.value = window._savedCurrency || 'USD';
  delete window._savedCurrency;
}


function saveInputs () {
  const loanAmount   = document.getElementById('amount').value;
  const interestRate = document.getElementById('rate').value;
  const loanTerm     = document.getElementById('time').value;
  const currency     = document.getElementById('currency').value;
  const interestType = document.getElementById('interestType').value;

  // ── LOCAL SAVE ───────────────────────────────────────────
  localStorage.setItem('amount',       loanAmount);
  localStorage.setItem('rate',         interestRate);
  localStorage.setItem('time',         loanTerm);
  localStorage.setItem('currency',     currency);
  localStorage.setItem('interestType', interestType);

  // ── CLOUD SAVE ───────────────────────────────────────────
  if (!window._firebase) return;

  const { auth, db, doc, setDoc } = window._firebase;
  const user = auth.currentUser;

  if (!user) return;

  setDoc(
    doc(db, 'users', user.uid),
    {
      loanInputs: {
        amount:       parseFloat(loanAmount)   || 0,
        rate:         parseFloat(interestRate) || 0,
        time:         parseFloat(loanTerm)     || 0,
        currency:     currency,
        interestType: interestType
      }
    },
    { merge: true }
  ).catch(err => {

    console.warn('Firestore save failed:', err.message);
  });
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
  const maxRows = data.months;

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

//==================================================
//VIRTUAL TABLE STATE
//==================================================
let _vtSchedule = [];
let _vtCurrency = '';
let _vtScrollHandler = null;
const ROW_HEIGHT = 36;
const BUFFER = 5;

function renderAmortizationTable (schedule, currency) {
  _vtSchedule = schedule;
  _vtCurrency = currency;

  const scrollEl = document.querySelector('.table-scroll');
  const tbody = document.querySelector(`#breakdownTable tbody`);

  const totalHeight = schedule.length * ROW_HEIGHT;

  let topSpacer = document.getElementById('vt-top-spacer');
  let bottomSpacer = document.getElementById('vt-bottom-spacer');

  if (!topSpacer) {
    topSpacer = document.createElement('tr');
    topSpacer.id = 'vt-top-spacer';
    const tdTop = document.createElement('td');
    tdTop.colspan = 5;
    tdTop.style.padding = '0';
    tdTop.style.border = 'none';
    topSpacer.appendChild(tdTop);
    tbody.appendChild(topSpacer);

    bottomSpacer = document.createElement('tr');
    bottomSpacer.id = 'vt-bottom-spacer';
    const tdBottom = document.createElement('td');
    tdBottom.colspan = 5;
    tdBottom.style.padding = '0';
    tdBottom.style.border = 'none';
    bottomSpacer.appendChild(tdBottom);
    tbody.appendChild(bottomSpacer);
  }

  _renderVisibleRows(scrollEl, tbody, topSpacer, bottomSpacer);

  if (scrollEl._vtScrollHandler) {
    scrollEl.removeEventListener('scroll', _vtScrollHandler);
  }

  _vtScrollHandler = function () {
    _renderVisibleRows(scrollEl, tbody, topSpacer, bottomSpacer);
  };

  scrollEl.addEventListener('scroll', _vtScrollHandler, {passive: true});

}

function _renderVisibleRows(scrollEl, tbody, topSpacer, bottomSpacer) {
  const scrollTop = scrollEl.scrollTop;
  const viewHeight = scrollEl.clientHeight;

  const totalRows = _vtSchedule.length;

  const firstVisible = Math.floor(scrollTop / ROW_HEIGHT);
  const lastVisible = Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT);

  const renderStart = Math.max(0, firstVisible - BUFFER);
  const renderEnd = Math.min(totalRows - 1, lastVisible + BUFFER);

  const topSpacerHeight = renderStart * ROW_HEIGHT;
  const bottomSpacerHeight = (totalRows - 1 - renderEnd) * ROW_HEIGHT;

  topSpacer.firstElementChild.style.height = topSpacerHeight + 'px';
  bottomSpacer.firstElementChild.style.height = bottomSpacerHeight + 'px';

  const existingRows = Array.from(tbody.querySelectorAll('tr:not(#vt-top-spacer):not(#vt-bottom-spacer)'));
  existingRows.forEach(r => r.remove());

  const fragment = document.createDocumentFragment();

  for (let i = renderStart; i<= renderEnd; i++) {
    const rowData = _vtSchedule[i];
    const row = document.createElement('tr');
  

    row.innerHTML = `<td>${rowData.month}</td>
    <td>${formatNumber(rowData.payment, _vtCurrency)}</td>
    <td>${formatNumber(rowData.interest, _vtCurrency)}</td>
    <td>${formatNumber(rowData.principal, _vtCurrency)}</td>
    <td>${formatNumber(rowData.balance, _vtCurrency)}</td>`;

    fragment.appendChild(row);

  }

  tbody.insertBefore(fragment, bottomSpacer);
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
  const isOpen = sidebar.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    sidebar.inert = false;
    const firstItem = sidebar.querySelector('.menu-item');
    if (firstItem) firstItem.focus();
  } else {
    menuToggle.focus();
    sidebar.inert = true;
  }
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


emiChartBtn.addEventListener('click', async function () {
  const loanData = getLoanInputs();
  const validation = validateLoanInputs(loanData);

  if (!validation.isValid || loanData.interestType === 'simple') {
    showSection('emiChartSection');
    document.getElementById('emiChart').style.display = 'none';
    document.getElementById('emiSimpleMsg').style.display = 'block';
    return;
  }

  try {
    await loadScript(CDN_CHARTJS);
  } catch (e) {
    console.error('Chart.js failed to load:', e);
    return;
  }

  const loanResult = calculateCompoundLoan(loanData);
  const schedule   = generateAmortizationSchedule(loanData, loanResult);

showSection('emiChartSection');
  document.getElementById('emiChart').style.display = 'block';
  document.getElementById('emiSimpleMsg').style.display = 'none';

  renderEmiChart(schedule);
  trackEvent('tool_opened', { tool_name: 'emi_chart' });
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
} else if (validation.isValid && loanData.interestType === 'compound') {
    exportMsg.style.display = 'none';
    downloadCsvBtn.style.display = 'block';
    showSection('paymentScheduleSection');
    trackEvent('tool_opened', { tool_name: 'export_schedule' });
  }
});

downloadCsvBtn.addEventListener('click', function () {
  const loanData = getLoanInputs();
  const loanResult = calculateCompoundLoan(loanData);
  const schedule = generateAmortizationSchedule(loanData, loanResult);

  const csv = generateCSV(schedule, loanData.currency);
  const filename = `loan_schedule_${loanData.currency}_${loanData.amount}.csv`;

  downloadCSV(csv, filename);
  trackEvent('file_downloaded', {
    file_type: 'csv',
    currency:  loanData.currency
  });
});


//===========================================
//LOAN COMPARISON MODULE
//===========================================
const loanComparisonBtn = document.getElementById('loanComparisonBtn')
const runComparisonBtn = document.getElementById('runComparisonBtn');

function getCompBElements () {
  return {
compAmountInput: document.getElementById('compAmount'),
compRateInput: document.getElementById('compRate'),
compTimeInput: document.getElementById('compTime'),

compAmountError: document.getElementById('compAmountError'),
compRateError: document.getElementById('compRateError'),
compTimeError: document.getElementById('compTimeError'),
  }
}

function renderCompBErrors (amountErr, rateErr, timeErr) {
  const {compAmountInput, compRateInput, compTimeInput, compAmountError, compRateError, compTimeError} = getCompBElements();
  //Amount
  if (amountErr) {
    compAmountError.textContent = `This field is required!`;
    compAmountError.style.opacity = '1';
    compAmountError.style.height = 'auto';
    compAmountInput.classList.add('input-error');
  }

  //Rate
  if (rateErr) {
    compRateError.textContent = `This field is required!`;
    compRateError.style.opacity = '1';
    compRateError.style.height = 'auto';
    compRateInput .classList.add('input-error');
  }

  //Time
  if (timeErr) {
    compTimeError.textContent = `This field is required!`;
    compTimeError.style.opacity = '1';
    compTimeError.style.height = 'auto';
    compTimeInput .classList.add('input-error');
  }
}


function clearCompBErrors () {
  const {compAmountInput, compRateInput, compTimeInput, compAmountError, compRateError, compTimeError} = getCompBElements();

  compAmountError.textContent = '';
  compRateError.textContent = '';
  compTimeError.textContent = '';

  compAmountError.style.opacity = '0';
  compRateError.style.opacity = '0';
  compTimeError.style.opacity = '0';

  compAmountError.style.height = '0';
  compRateError.style.height = '0';
  compTimeError.style.height = '0';

  compAmountInput.classList.remove('input-error');
  compRateInput.classList.remove('input-error');
  compTimeInput.classList.remove('input-error');

}

function calculateLoanForComparison (amount, rate, months, type) {
  //Reusing existing calculation functions with a data-shaped object
  const data ={amount, rate, months};
  return type === 'simple'? calculateSimpleLoan(data): calculateCompoundLoan(data);
}

function renderComparisonTable (loanA, loanAData, loanB, loanBData) {
  const tbody = document.querySelector('#comparisonTable tbody');
  tbody.innerHTML = '';

  const currency = loanAData.currency;

  const metrics = [
    {
      label: 'Loan Amount',
      a: formatNumber(loanAData.amount, loanAData.currency),
      b: formatNumber(loanBData.amount, loanAData.currency),
      neutral: true,
      preFormatted: true
    },
    {
      label: 'Interest Rate',
      a: `${loanAData.rate}% p.a.`,
      b: `${loanBData.rate}% p.a.`,
      neutral: true,
      preFormatted: true
    },
    {
      label: `Loan Type`,
      a: loanAData.interestType.charAt(0).toUpperCase() + loanAData.interestType.slice(1),
      b: loanBData.interestType.charAt(0).toUpperCase() + loanBData.interestType.slice(1),
      neutral: true,
      preFormatted: true
    },
    {
      label: 'Duration (months)',
      a: `${loanAData.months} months`,
      b: `${loanBData.months} months`,
      neutral: true,
      preFormatted: true
    },
    {
      label: 'Monthyl Payment',
      a: loanA.monthly,
      b: loanB.monthly,
      lowerIsBetter: true
    },
    {
      label: 'Total Interest',
      a: loanA.interest,
      b: loanB.interest,
      lowerIsBetter: true
    },
    {
      
      label: 'Total Payment',
      a: loanA.total,
      b: loanB.total,
      lowerIsBetter: true
    }
  ];

  metrics.forEach(metric => {
    const row = document.createElement('tr');

    let classA = '';
    let classB = '';

    if (!metric.neutral) {
      if(metric.a < metric.b) {
        classA = metric.lowerIsBetter ? 'comp-winner' : 'comp-loser';
        classB = metric.lowerIsBetter ? 'comp-loser' : 'comp-winner';
      } else if (metric.b < metric.a) {
        classB = metric.lowerIsBetter ? 'comp-winner' : 'comp-loser';
        classA = metric.lowerIsBetter ? 'comp-loser' : 'comp-winner';
      } else {
        classA = 'comp-tie';
        classB = 'comp-tie';
      }
    }

    const formatA = (metric.neutral || metric.preFormatted) ? metric.a: formatNumber(metric.a, currency);
    const formatB = (metric.neutral || metric.preFormatted) ? metric.b: formatNumber(metric.b, currency);

    row.innerHTML = `<td>${metric.label}</td>
    <td class="${classA}">${formatA}</td>
    <td class="${classB}">${formatB}</td>`;

    tbody.appendChild(row);
  });
}

function renderComparisonVerdict (loanA, loanB, currency) {
  const verdict = document.getElementById('comparisonVerdict');
  const diff = Math.abs(loanA.total - loanB.total);
  const diffFormated = formatNumber(diff, currency);

  if (loanA.total === loanB.total) {
    verdict.innerHTML = `<p style="color:aqua; font-size:14px; text-align:center;">Both loans cost the same total.</p>`;

  } else if (loanA.total < loanB.total) {
    verdict.innerHTML = `<p style="color:rgb(0, 200, 80); font-size: 14px; text-align:center;">&#9989; Loan A (Dashboard) is cheaper by <strong>${diffFormated}</strong> overall.
    </p>`;

  } else {
    verdict.innerHTML = `<p style="color:rgb(0, 200, 80); font-size: 14px; text-align:center;">&#9989; Loan B (Alternative) is cheaper by <strong>${diffFormated}</strong> overall.
    </p>`;

  }
}

loanComparisonBtn.addEventListener('click', function () {
  showSection('loanComparisonSection');
  document.getElementById('comparisonResults').style.display = 'none';
  trackEvent('tool_opened', { tool_name: 'loan_comparison' });
});

runComparisonBtn.addEventListener('click', function () {
  const loanAData = getLoanInputs();
  const validationA = validateLoanInputs(loanAData);

  const errorBox = document.getElementById('comparisonInputError');

  if (!validationA.isValid) {
    errorBox.style.display = 'block';
    document.getElementById('comparisonResults').style.display = 'none';
    return;
  }

  errorBox.style.display = 'none';


  const amountB = parseFloat(document.getElementById('compAmount').value);
  const rateB = parseFloat(document.getElementById('compRate').value);
  const monthsB = parseFloat(document.getElementById('compTime').value);
  const typeB = document.getElementById('compInterestType').value;

  const amountBErr = !amountB || amountB <= 0;
  const rateBErr = !rateB || rateB <= 0;
  const timeBErr = !monthsB || monthsB <= 0;

  clearCompBErrors();

  if (amountBErr || rateBErr || timeBErr) {
    renderCompBErrors (amountBErr, rateBErr, timeBErr);
    document.getElementById('comparisonResults').style.display = 'none';
    return;
  }

  clearCompBErrors();

  const loanBData = {amount: amountB, rate: rateB, months: monthsB, interestType: typeB};

  const loanA = calculateLoanForComparison(loanAData.amount, loanAData.rate, loanAData.months, loanAData.interestType);

  const loanB = calculateLoanForComparison(amountB, rateB, monthsB, typeB);

  renderComparisonTable(loanA, loanAData, loanB, loanBData);
  renderComparisonVerdict(loanA, loanB, loanAData.currency);

  document.getElementById('comparisonResults').style.display = 'block';

});

document.getElementById('compAmount').addEventListener('input', () => {
  const el = document.getElementById('compAmount');
  const err = document.getElementById('compAmountError');
  el.classList.remove('input-error');
  err.textContent = '';
  err.style.opacity = '0';
  err.style.height = '0';
});

document.getElementById('compRate').addEventListener('input', () => {
  const el = document.getElementById('compRate');
  const err = document.getElementById('compRateError');
  el.classList.remove('input-error');
  err.textContent = '';
  err.style.opacity = '0';
  err.style.height = '0';
});

document.getElementById('compTime').addEventListener('input', () => {
  const el = document.getElementById('compTime');
  const err = document.getElementById('compTimeError');
  el.classList.remove('input-error');
  err.textContent = '';
  err.style.opacity = '0';
  err.style.height = '0';
});



//===================================================
//SAVINGS CALCULATOR MODULE
//===================================================
const savingsBtn = document.getElementById('savingsBtn');
const calculateSavingsBtn = document.getElementById('calculateSavingsBtn');

function getSavingsInputs() {
  return {
    amount: parseFloat(document.getElementById('savingsAmount').value),
    rate: parseFloat(document.getElementById('savingsRate').value),
    months: parseFloat(document.getElementById('savingsTime').value),
    currency: currencySelect.value,
  };
}

function validateSavingsInputs(data) {
  const errors = {};
  if (!data.amount || data.amount <= 0) errors.amount = true;
  if (!data.rate || data.rate <= 0) errors.rate = true;
  if (!data.months || data.months <= 0) errors.time = true;
  return { isValid: Object.keys(errors).length === 0, errors };
}

function renderSavingsErrors(errors) {
  clearSavingsErrors();

  if (errors.amount) {
    const el = document.getElementById('savingsAmountError');
    el.textContent = 'This field is required!';
    el.style.opacity = '1';
    el.style.height = 'auto';
    document.getElementById('savingsAmount').classList.add('input-error');
  }
  if (errors.rate) {
    const el = document.getElementById('savingsRateError');
    el.textContent = 'This field is required!';
    el.style.opacity = '1';
    el.style.height = 'auto';
    document.getElementById('savingsRate').classList.add('input-error');
  }
  if (errors.time) {
    const el = document.getElementById('savingsTimeError');
    el.textContent = 'This field is required!';
    el.style.opacity = '1';
    el.style.height = 'auto';
    document.getElementById('savingsTime').classList.add('input-error');
  }
}

function clearSavingsErrors() {
  ['savingsAmount', 'savingsRate', 'savingsTime'].forEach(id => {
    const input = document.getElementById(id);
    const err = document.getElementById(id + 'Error');
    if (input) input.classList.remove('input-error');
    if (err) {
      err.textContent = '';
      err.style.opacity = '0';
      err.style.height = '0';
    }
  });
}

function calculateSavings(data) {
  const r = data.rate / 100 / 12;    // monthly interest rate
  const n = data.months;              // number of months
  const pmt = data.amount;            // monthly deposit

  let futureValue;

  if (r === 0) {
    // Edge case: 0% interest — just multiply
    futureValue = pmt * n;
  } else {
    // Standard future value of annuity formula
    futureValue = pmt * ((Math.pow(1 + r, n) - 1) / r);
  }

  const totalDeposited = pmt * n;
  const interestEarned = futureValue - totalDeposited;

  return { futureValue, totalDeposited, interestEarned, monthlyRate: r };
}

function generateSavingsSchedule(data) {
  // Build year-by-year snapshot
  const schedule = [];
  const r = data.rate / 100 / 12;
  const pmt = data.amount;

  let balance = 0;
  const totalYears = Math.ceil(data.months / 12);

  for (let year = 1; year <= totalYears; year++) {
    // How many months in this year (last year may be partial)
    const monthsThisYear = Math.min(year * 12, data.months) - (year - 1) * 12;
    const monthsElapsed = (year - 1) * 12;

    // Future value at end of this year from all deposits so far
    const monthsTotal = Math.min(year * 12, data.months);

    let fv;
    if (r === 0) {
      fv = pmt * monthsTotal;
    } else {
      fv = pmt * ((Math.pow(1 + r, monthsTotal) - 1) / r);
    }

    const deposited = pmt * monthsTotal;
    const interest = fv - deposited;

    schedule.push({ year, deposited, interest, balance: fv });
  }

  return schedule;
}

function renderSavingsTable(schedule, currency) {
  const tbody = document.querySelector('#savingsTable tbody');
  tbody.innerHTML = '';

  schedule.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>Year ${row.year}</td>
      <td>${formatNumber(row.deposited, currency)}</td>
      <td>${formatNumber(row.interest, currency)}</td>
      <td>${formatNumber(row.balance, currency)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSavingsResults(result, currency) {
  animateValue(document.getElementById('savingsPrincipal'), 0, result.totalDeposited, 600, currency);
  animateValue(document.getElementById('savingsInterest'), 0, result.interestEarned, 600, currency);
  animateValue(document.getElementById('savingsFinal'), 0, result.futureValue, 600, currency);
}

savingsBtn.addEventListener('click', function () {
  showSection('savingsSection');
  document.getElementById('savingsResults').style.display = 'none';
  trackEvent('tool_opened', { tool_name: 'savings_calculator' });
});

calculateSavingsBtn.addEventListener('click', function () {
  const data = getSavingsInputs();
  const validation = validateSavingsInputs(data);

  if (!validation.isValid) {
    renderSavingsErrors(validation.errors);
    document.getElementById('savingsResults').style.display = 'none';
    return;
  }

  clearSavingsErrors();

  const result = calculateSavings(data);
  const schedule = generateSavingsSchedule(data);

  renderSavingsResults(result, data.currency);
  renderSavingsTable(schedule, data.currency);

  document.getElementById('savingsResults').style.display = 'block';
});

// Live error clearing
['savingsAmount', 'savingsRate', 'savingsTime'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const input = document.getElementById(id);
    const err = document.getElementById(id + 'Error');
    input.classList.remove('input-error');
    err.textContent = '';
    err.style.opacity = '0';
    err.style.height = '0';
  });
});



//===================================================
//REFINANCING CALCULATOR MODULE
//===================================================
const refinanceBtn = document.getElementById('refinanceBtn');
const calculateRefiBtn = document.getElementById('calculateRefiBtn');

const refiFields = [
  { id: 'refiBalance',       errId: 'refiBalanceError' },
  { id: 'refiCurrentRate',   errId: 'refiCurrentRateError' },
  { id: 'refiCurrentMonths', errId: 'refiCurrentMonthsError' },
  { id: 'refiNewRate',       errId: 'refiNewRateError' },
  { id: 'refiNewMonths',     errId: 'refiNewMonthsError' },
];

function getRefiInputs() {
  return {
    balance:       parseFloat(document.getElementById('refiBalance').value),
    currentRate:   parseFloat(document.getElementById('refiCurrentRate').value),
    currentMonths: parseFloat(document.getElementById('refiCurrentMonths').value),
    newRate:       parseFloat(document.getElementById('refiNewRate').value),
    newMonths:     parseFloat(document.getElementById('refiNewMonths').value),
    fee:           parseFloat(document.getElementById('refiFee').value) || 0,
    currency:      currencySelect.value,
  };
}

function validateRefiInputs(data) {
  const errors = {};
  if (!data.balance       || data.balance <= 0)       errors.refiBalance = true;
  if (!data.currentRate   || data.currentRate <= 0)   errors.refiCurrentRate = true;
  if (!data.currentMonths || data.currentMonths <= 0) errors.refiCurrentMonths = true;
  if (!data.newRate       || data.newRate <= 0)       errors.refiNewRate = true;
  if (!data.newMonths     || data.newMonths <= 0)     errors.refiNewMonths = true;
  return { isValid: Object.keys(errors).length === 0, errors };
}

function renderRefiErrors(errors) {
  clearRefiErrors();
  refiFields.forEach(({ id, errId }) => {
    if (errors[id]) {
      const err = document.getElementById(errId);
      err.textContent = 'This field is required!';
      err.style.opacity = '1';
      err.style.height = 'auto';
      document.getElementById(id).classList.add('input-error');
    }
  });
}

function clearRefiErrors() {
  refiFields.forEach(({ id, errId }) => {
    const input = document.getElementById(id);
    const err = document.getElementById(errId);
    input.classList.remove('input-error');
    err.textContent = '';
    err.style.opacity = '0';
    err.style.height = '0';
  });
}

function calculateRefinancing(data) {
  // Monthly payment formula reused from compound loan logic
  function monthlyPayment(principal, annualRate, months) {
    const r = annualRate / 100 / 12;
    if (r === 0) return principal / months;
    return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }

  const oldPayment = monthlyPayment(data.balance, data.currentRate, data.currentMonths);
  const newPayment = monthlyPayment(data.balance, data.newRate, data.newMonths);

  const oldInterest = (oldPayment * data.currentMonths) - data.balance;
  const newInterest = (newPayment * data.newMonths) - data.balance;

  const monthlySaving = oldPayment - newPayment;
  const interestSaving = oldInterest - newInterest - data.fee;

  const breakEvenMonths = monthlySaving > 0 && data.fee > 0
  ? Math.ceil(data.fee / monthlySaving)
  : null;

return { oldPayment, newPayment, monthlySaving, interestSaving, breakEvenMonths };
}

function renderRefiResults(result, data) {
  const currency = data.currency;

  animateValue(document.getElementById('refiOldPayment'),    0, result.oldPayment,    600, currency);

  animateValue(document.getElementById('refiNewPayment'),    0, result.newPayment,    600, currency);

  animateValue(document.getElementById('refiMonthlySaving'), 0, Math.abs(result.monthlySaving), 600, currency);

  animateValue(document.getElementById('refiTotalSaving'), 0, Math.abs(result.interestSaving), 600, currency);


  // Color monthly saving box
  const monthlyEl = document.getElementById('refiMonthlySaving');
  monthlyEl.className = result.monthlySaving > 0 ? 'refi-positive' : 'refi-negative';

  // Color total saving box
  const totalEl = document.getElementById('refiTotalSaving');
  totalEl.className = result.interestSaving > 0 ? 'refi-positive' : 'refi-negative';

  // Verdict
  const verdict = document.getElementById('refiVerdict');

  if (result.monthlySaving <= 0) {
    verdict.innerHTML = `<p style="color: rgb(255,90,90); font-size:14px; text-align:center;">
      &#10060; Refinancing increases your monthly payment. Not recommended unless you need a longer term.
    </p>`;

  } else if (result.interestSaving <= 0) {
    verdict.innerHTML = `<p style="color: rgb(255,200,0); font-size:14px; text-align:center;">
      &#9888;&#65039; You save monthly but the fee outweighs your interest savings. Reconsider the fee or term.
    </p>`;

  } else {
    let breakEvenMsg = '';
    if (result.breakEvenMonths) {
      breakEvenMsg = ` Your refinancing fee is recovered in <strong>${result.breakEvenMonths} months</strong>.`;
    }
    verdict.innerHTML = `<p style="color: rgb(0,200,80); font-size:14px; text-align:center;">
      &#9989; Refinancing saves you <strong>${formatNumber(result.interestSaving, currency)}</strong> in interest overall.${breakEvenMsg}
    </p>`;
  }
}

refinanceBtn.addEventListener('click', function () {
  showSection('refinanceSection');
  document.getElementById('refiResults').style.display = 'none';
  trackEvent('tool_opened', { tool_name: 'refinancing' });
});
calculateRefiBtn.addEventListener('click', function () {
  const data = getRefiInputs();
  const validation = validateRefiInputs(data);

  if (!validation.isValid) {
    renderRefiErrors(validation.errors);
    document.getElementById('refiResults').style.display = 'none';
    return;
  }

  clearRefiErrors();

  const result = calculateRefinancing(data);

  renderRefiResults(result, data);

  document.getElementById('refiResults').style.display = 'block';
});

// Live error clearing
refiFields.forEach(({ id, errId }) => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('input-error');
    const err = document.getElementById(errId);
    err.textContent = '';
    err.style.opacity = '0';
    err.style.height = '0';
  });
});



//===================================================
//EXTRA PAYMENT SIMULATION MODULE
//===================================================
const extraPaymentBtn = document.getElementById('extraPaymentBtn');
const calculateExtraBtn = document.getElementById('calculateExtraBtn');

function simulateExtraPayment(data, extraMonthly) {
  // Standard compound monthly rate
  const r = data.rate / 100 / 12;

  // Normal monthly payment (reuse compound formula)
  const normalPayment = r === 0
    ? data.amount / data.months
    : data.amount * (r * Math.pow(1 + r, data.months)) / (Math.pow(1 + r, data.months) - 1);

  // ── Simulate NORMAL payoff ──
  let normalBalance = data.amount;
  let normalInterest = 0;
  const normalSchedule = [];

  for (let month = 1; month <= data.months; month++) {
    const interestCharge = normalBalance * r;
    const principalCharge = normalPayment - interestCharge;
    normalBalance -= principalCharge;
    normalInterest += interestCharge;
    if (normalBalance < 0) normalBalance = 0;

    // Snapshot at end of each year
    if (month % 12 === 0 || month === data.months) {
      normalSchedule.push({
        year: Math.ceil(month / 12),
        balance: Math.max(normalBalance, 0)
      });
    }
  }

  // ── Simulate EXTRA PAYMENT payoff ──
  let extraBalance = data.amount;
  let extraInterest = 0;
  let extraMonths = 0;
  const extraSchedule = [];

  while (extraBalance > 0 && extraMonths < data.months * 2) {
    const interestCharge = extraBalance * r;
    const principalCharge = normalPayment + extraMonthly - interestCharge;

    extraBalance -= principalCharge;
    extraInterest += interestCharge;
    extraMonths++;

    if (extraBalance < 0) extraBalance = 0;

    // Snapshot at end of each year or when paid off
    if (extraMonths % 12 === 0 || extraBalance === 0) {
      extraSchedule.push({
        year: Math.ceil(extraMonths / 12),
        balance: Math.max(extraBalance, 0)
      });
    }

    if (extraBalance === 0) break;
  }

  const monthsSaved = data.months - extraMonths;
  const interestSaved = normalInterest - extraInterest;

  return {
    normalPayment,
    normalMonths: data.months,
    normalInterest,
    extraMonths,
    extraInterest,
    monthsSaved,
    interestSaved,
    normalSchedule,
    extraSchedule,
  };
}

function renderExtraPaymentTable(result, currency) {
  const tbody = document.querySelector('#extraPaymentTable tbody');
  tbody.innerHTML = '';

  const maxYears = Math.ceil(result.normalMonths / 12);

  for (let y = 1; y <= maxYears; y++) {
    const normalRow = result.normalSchedule.find(r => r.year === y);
    const extraRow  = result.extraSchedule.find(r => r.year === y);

    const normalBal = normalRow ? formatNumber(normalRow.balance, currency) : '—';
    // Once extra loan is paid off, show Paid Off
    const extraBal  = extraRow  ? formatNumber(extraRow.balance, currency)  : '&#10003; Paid Off';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>Year ${y}</td>
      <td class="extra-normal">${normalBal}</td>
      <td class="extra-faster">${extraBal}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderExtraPaymentResults(result, currency) {
  // Term boxes — show in months
  document.getElementById('extraOriginalTerm').textContent  = `${result.normalMonths} months`;
  document.getElementById('extraNewTerm').textContent       = `${result.extraMonths} months`;
  document.getElementById('extraMonthsSaved').textContent   = `${result.monthsSaved} months`;

  // Interest saved — animate
  animateValue(document.getElementById('extraInterestSaved'), 0, result.interestSaved, 600, currency);

  // Verdict
  const verdict = document.getElementById('extraVerdict');

  if (result.monthsSaved <= 0) {
    verdict.innerHTML = `<p style="color: aqua; font-size:14px; text-align:center;">
      No time saved — your extra payment is too small to meaningfully reduce the term.
    </p>`;
  } else {
    const years  = Math.floor(result.monthsSaved / 12);
    const months = result.monthsSaved % 12;

    let timeMsg = '';
    if (years > 0 && months > 0) timeMsg = `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
    else if (years > 0)          timeMsg = `${years} year${years > 1 ? 's' : ''}`;
    else                         timeMsg = `${months} month${months > 1 ? 's' : ''}`;

    verdict.innerHTML = `<p style="color: rgb(0,200,80); font-size:14px; text-align:center;">
      &#9989; You pay off <strong>${timeMsg}</strong> early and save <strong>${formatNumber(result.interestSaved, currency)}</strong> in interest.
    </p>`;
  }
}

extraPaymentBtn.addEventListener('click', function () {
  showSection('extraPaymentSection');
  document.getElementById('extraPaymentResults').style.display = 'none';
  document.getElementById('extraTableWrapper').style.display = 'none';
  document.getElementById('toggleExtraTableBtn').innerHTML = '&#9660; Show Balance Comparison';
  document.getElementById('extraResultsBoxes').style.display = 'block';
  document.getElementById('extraVerdict').style.display = 'block';
  trackEvent('tool_opened', { tool_name: 'extra_payment' });
});

calculateExtraBtn.addEventListener('click', function () {
  const loanData = getLoanInputs();
  const validation = validateLoanInputs(loanData);

  const dashError = document.getElementById('extraPaymentDashboardError');

  // Must be compound — simulation uses monthlyRate
  if (!validation.isValid || loanData.interestType === 'simple') {
    dashError.style.display = 'block';
    dashError.querySelector('p').textContent = !validation.isValid
      ? 'Please fill in your loan details on the Dashboard first.'
      : 'Extra payment simulation is only available for Compound Interest loans.';
    document.getElementById('extraPaymentResults').style.display = 'none';
    return;
  }

  dashError.style.display = 'none';

  const extraAmount = parseFloat(document.getElementById('extraAmount').value);
  const extraErr = document.getElementById('extraAmountError');

  if (!extraAmount || extraAmount <= 0) {
    extraErr.textContent = 'This field is required!';
    extraErr.style.opacity = '1';
    extraErr.style.height = 'auto';
    document.getElementById('extraAmount').classList.add('input-error');
    document.getElementById('extraPaymentResults').style.display = 'none';
    return;
  }

  extraErr.textContent = '';
  extraErr.style.opacity = '0';
  extraErr.style.height = '0';
  document.getElementById('extraAmount').classList.remove('input-error');

  const result = simulateExtraPayment(loanData, extraAmount);

  renderExtraPaymentResults(result, loanData.currency);
  renderExtraPaymentTable(result, loanData.currency);

  document.getElementById('extraPaymentResults').style.display = 'block';
  document.getElementById('extraTableWrapper').style.display = 'none';
  document.getElementById('extraResultsBoxes').style.display = 'block';
  document.getElementById('extraVerdict').style.display = 'block';
  document.getElementById('toggleExtraTableBtn').innerHTML = '&#9660; Show Balance Comparison';
});

document.getElementById('extraAmount').addEventListener('input', () => {
  document.getElementById('extraAmount').classList.remove('input-error');
  const err = document.getElementById('extraAmountError');
  err.textContent = '';
  err.style.opacity = '0';
  err.style.height = '0';
});

document.getElementById('toggleExtraTableBtn').addEventListener('click', function () {
  const wrapper = document.getElementById('extraTableWrapper');
  const resultsBoxes = document.getElementById('extraResultsBoxes');
  const verdict = document.getElementById('extraVerdict');
  const isHidden = wrapper.style.display === 'none';

  if (isHidden) {
    // Opening table — hide results, show table
    resultsBoxes.style.display = 'none';
    verdict.style.display = 'none';
    wrapper.style.display = 'block';
    this.innerHTML = '&#9650; Hide Balance Comparison';
  } else {
    // Closing table — show results, hide table
    resultsBoxes.style.display = 'block';
    verdict.style.display = 'block';
    wrapper.style.display = 'none';
    this.innerHTML = '&#9660; Show Balance Comparison';
  }
});



//=========================================
//PDF DOWNLOAD MODULE
//=========================================
const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');

function generatePDF () {
  const loanData = getLoanInputs();
  const validation = validateLoanInputs(loanData);

  //jsPDF attaches to window when loaded via UMD CDN
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();

  //_________HEADER_________
  doc.setFillColor(10, 12, 20);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(0, 200, 80);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Loan Summary Report', 14, 18);

  doc.setTextColor(180, 180, 180);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal'); // Bug 4 fixed: was 'helvitica'
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'})}`, 14, 28);
  doc.text(`Currency: ${loanData.currency} | Interest Type: ${loanData.interestType}`, 14, 35);

  //_________LOAN INPUT SECTION_______
  doc.setTextColor(0, 155, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Loan Details', 14, 52);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const loanResult = loanData.interestType === 'simple'? calculateSimpleLoan(loanData): calculateCompoundLoan(loanData);

  const detailsData = [
    ['Loan Amount', formatNumber(loanData.amount, loanData.currency)],
    ['Loan Interest', `${loanData.rate}% p.a.`],
    ['Loan Duration', `${loanData.months} months`],
    ['Monthly Payment', formatNumber(loanResult.monthly, loanData.currency)],
    ['Total Interest', formatNumber(loanResult.interest, loanData.currency)], // Bug 5 fixed: was 'Toal Interest'
    ['Total Payment', formatNumber(loanResult.total, loanData.currency)],
  ];

  doc.autoTable ({
    startY: 56,
    head:[['Field', 'Value']],
    body:detailsData,
    theme:'grid',
    headStyles:{fillColor:[0, 80, 160], textColor:255, fontStyle:'bold'},
    alternateRowStyles:{fillColor:[240, 245, 255]},
    styles:{fontSize:10, cellPadding:4},
    columnStyles:{0:{fontStyle:'bold', cellWidth:60}},
    margin:{left:14, right: 14},
  });

  //________AMORTIZATION TABLE (copmpound only)_______
  if (loanData.interestType === 'compound') {
    const schedule = generateAmortizationSchedule(loanData, loanResult);
    const maxRows = Math.min(schedule.length, 120);

    const tableRows =schedule.slice(0, maxRows).map(row => [
      row.month,
      formatNumber(row.payment, loanData.currency),
      formatNumber(row.interest, loanData.currency),
      formatNumber(row.principal, loanData.currency),
      formatNumber(row.balance, loanData.currency),
    ]);

    const afterDetails = doc.lastAutoTable.finalY + 10;

    doc.setTextColor(0, 155, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Amortization Schedule', 14, afterDetails);

    doc.autoTable({
      startY: afterDetails + 4,
      head: [['Month', 'Payment', 'Interest', 'Principal', 'Balance']],
      body: tableRows,
      theme: 'striped',
      headStyles: {fillColor: [0, 180, 160], textColor: 255, fontStyle: 'bold'},
      styles: {fontSize: 8, cellPadding: 3},
      margin: {left: 14, right: 14},
    });
  }

  //______FOOTER ON EVERY PAGE_____
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(8);
    doc.text(`Loan Calculator | Page ${i} of ${pageCount}`, 14, 290);
  }

  doc.save(`loan_report_${loanData.currency}_${loanData.amount}.pdf`);
  trackEvent('file_downloaded', {
    file_type: 'pdf',
    currency:  loanData.currency
  });
}


pdfDownloadBtn.addEventListener('click', async function () {
  const loanData   = getLoanInputs();
  const validation = validateLoanInputs(loanData);
  const pdfErrorMsg  = document.getElementById('pdfErrorMsg');

  if (!validation.isValid || loanData.interestType === 'simple') {
    showSection('paymentScheduleSection');
    document.getElementById('exportMsg').style.display = 'none';
    document.getElementById('downloadCsvBtn').style.display = 'none';
    pdfErrorMsg.style.display = 'block';
    return;
  } else if (loanData.interestType === 'compound') {
    pdfErrorMsg.style.display = 'none';
  }


  try {
    await loadScript(CDN_JSPDF);
    await loadScript(CDN_AUTOTABLE);
  } catch (e) {
    console.error('PDF library failed to load:', e);
    return;
  }

  generatePDF();
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
  trackEvent('tool_opened', { tool_name: 'dashboard' });
});
//EVENT LISTENERS
amortizationBtn.addEventListener('click', function () {

  if (document.getElementById('amount').value) {
    calculateLoan();
  }

  showSection('amortizationSection');
  trackEvent('tool_opened', { tool_name: 'amortization_table' });
});


//============================================================//





//======================================
//APP INITIALIZATION
//======================================
//>>>>>>>>>>>>>>>>>>>>>>>>>>>
//LOAD SAVED INPUTS
//>>>>>>>>>>>>>>>>>>>>>>>>>>>
function loadSavedInputs () {

  // ── STEP 1: APPLY LOCALS IMMEDIATELY ────────────────────

  const sanitizeNumber = (key) => {
    const raw = localStorage.getItem(key);
    const parsed = parseFloat(raw);
    return isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const sanitizeString = (key) => {
    const raw = localStorage.getItem(key);
    return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;
  };

  const loanAmount   = sanitizeNumber('amount');
  const interestRate = sanitizeNumber('rate');
  const loanTerm     = sanitizeNumber('time');
  const currency     = sanitizeString('currency');
  const savedType    = sanitizeString('interestType');

  if (loanAmount)   amountInput.value  = loanAmount;
  if (interestRate) rateInput.value    = interestRate;
  if (loanTerm)     timeInput.value    = loanTerm;

  if (currency)  window._savedCurrency = currency;
  if (savedType) {
    const typeSelect = document.getElementById('interestType');
    if (typeSelect) typeSelect.value = savedType;
  }

  // ── STEP 2: FETCH FROM FIRESTORE ─────────────────────────

  if (!window._firebase) return;

  const { auth, db, doc, getDoc } = window._firebase;
  const user = auth.currentUser;

  if (!user) return;

  getDoc(doc(db, 'users', user.uid))
    .then(snapshot => {

      // If no document exists yet, the user is brand new — nothing to load
      if (!snapshot.exists()) return;

      const data = snapshot.data();

      // Guard: make sure loanInputs field exists in the document
      if (!data.loanInputs) return;

      const cloud = data.loanInputs;

      // Apply cloud values to inputs — overwrite local values
      if (cloud.amount   > 0) amountInput.value = cloud.amount;
      if (cloud.rate     > 0) rateInput.value   = cloud.rate;
      if (cloud.time     > 0) timeInput.value   = cloud.time;

      // Currency needs the deferred window approach again because
      // populateCurrencies() may not have run yet at this point
      if (cloud.currency) {
        window._savedCurrency = cloud.currency;
        // Also update the dropdown directly if it already has options
        if (currencySelect.options.length > 0) {
          currencySelect.value = cloud.currency;
        }
      }

      if (cloud.interestType) {
        const typeSelect = document.getElementById('interestType');
        if (typeSelect) typeSelect.value = cloud.interestType;
      }

      // Sync cloud values back to localStorage so they are
      // consistent if the user goes offline next session
      localStorage.setItem('amount',       cloud.amount);
      localStorage.setItem('rate',         cloud.rate);
      localStorage.setItem('time',         cloud.time);
      localStorage.setItem('currency',     cloud.currency     || 'USD');
      localStorage.setItem('interestType', cloud.interestType || 'compound');

      // Recalculate with the freshly loaded cloud values
      calculateLoan();
    })
    .catch(err => {
      // Non-blocking — if Firestore fails, localStorage values remain
      console.warn('Firestore load failed:', err.message);
    });
}


function initApp () {
  initDOMReferences();
  loadSavedInputs();
  getRates();
  calculateLoan();
}













//===================
//LIVE EVENTS
//===================

function bindInputEvents () {

  amountInput.addEventListener('input', function () {
    if (isSyncing) return;
    isSyncing = true;
    document.getElementById('convertAmount').value = this.value;
    debouncedCalculate();
    isSyncing = false;
  });

  rateInput.addEventListener('input', debouncedCalculate);
  timeInput.addEventListener('input', debouncedCalculate);

  currencySelect.addEventListener('change', function () {
    if (isSyncing) return;
    isSyncing = true;

    const selected = currencySelect.value;
    const from     = document.getElementById('fromCurrency');
    const to       = document.getElementById('toCurrency');
    const previousFrom = from.value;

    from.value = selected;

    if (to.value === previousFrom) {
      to.value = selected === 'USD' ? 'KES' : 'USD';
    }

    calculateLoan();
    convertCurrency();
    saveInputs();
    trackEvent('currency_selected', { currency_code: currencySelect.value });

    isSyncing = false;
  });

  const convertAmountInput = document.getElementById('convertAmount');
  const fromCurrencySelect = document.getElementById('fromCurrency');
  const toCurrencySelect   = document.getElementById('toCurrency');

  convertAmountInput.addEventListener('input', convertCurrency);
  fromCurrencySelect.addEventListener('change', convertCurrency);

  toCurrencySelect.addEventListener('change', function () {
    convertCurrency();
    currencySelect.value = this.value;
    calculateLoan();
    saveInputs();
  });

  interestType.addEventListener('change', function () {
    calculateLoan();
    saveInputs();
    trackEvent('interest_type_selected', { type: interestType.value });
  });

  document.getElementById('currencySearch').addEventListener('input',
    debounce(() => filterCurrencies('currencySearch', 'currency'), 200)
  );

  document.getElementById('fromSearch').addEventListener('input',
    debounce(() => filterCurrencies('fromSearch', 'fromCurrency'), 200)
  );

  document.getElementById('toSearch').addEventListener('input',
    debounce(() => filterCurrencies('toSearch', 'toCurrency'), 200)
  );

  // Clear validation errors as the user types
  const inputs = document.querySelectorAll('#amount, #rate, #time');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const error = document.getElementById(input.id + 'Error');
      if (error) {
        error.textContent  = '';
        error.style.opacity = '0';
        error.style.height  = '0';
      }
    });
  });
}


//===========================================
// AUTH MODULE
//===========================================

// ── TAB SWITCHING ───────────────────────────────────────────

document.getElementById('loginTabBtn').addEventListener('click', function () {
  // Show login form, hide register form
  document.getElementById('loginForm').style.display    = 'block';
  document.getElementById('registerForm').style.display = 'none';

  // Update tab active state
  this.classList.add('active');
  document.getElementById('registerTabBtn').classList.remove('active');

  // Clear any leftover errors from the register form
  clearAuthErrors();
});

document.getElementById('registerTabBtn').addEventListener('click', function () {
  // Show register form, hide login form
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('loginForm').style.display    = 'none';

  // Update tab active state
  this.classList.add('active');
  document.getElementById('loginTabBtn').classList.remove('active');

  // Clear any leftover errors from the login form
  clearAuthErrors();
});


// ── AUTH ERROR HELPERS ──────────────────────────────────────

function showFieldError (inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.add('input-error');
  error.textContent    = message;
  error.style.opacity  = '1';
  error.style.height   = 'auto';
}

function clearFieldError (inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.remove('input-error');
  error.textContent   = '';
  error.style.opacity = '0';
  error.style.height  = '0';
}

function showGeneralError (boxId, message) {
  const box = document.getElementById(boxId);
  box.textContent    = message;
  box.style.display  = 'block';
}

function clearAuthErrors () {
  // Clear all field errors and general error boxes across both forms
  ['loginEmail', 'loginPassword'].forEach(id => {
    document.getElementById(id).classList.remove('input-error');
  });
  ['loginEmailError', 'loginPasswordError'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent   = '';
    el.style.opacity = '0';
    el.style.height  = '0';
  });
  ['registerEmail', 'registerPassword', 'registerConfirm'].forEach(id => {
    document.getElementById(id).classList.remove('input-error');
  });
  ['registerEmailError', 'registerPasswordError', 'registerConfirmError'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent   = '';
    el.style.opacity = '0';
    el.style.height  = '0';
  });

  document.getElementById('loginError').style.display    = 'none';
  document.getElementById('registerError').style.display = 'none';
}


// ── FIREBASE ERROR CODE TRANSLATOR ─────────────────────────

function translateAuthError (code) {
  const map = {
    'auth/invalid-email':            'Please enter a valid email address.',
    'auth/user-not-found':           'No account found with this email.',
    'auth/wrong-password':           'Incorrect password. Please try again.',
    'auth/invalid-credential':       'Incorrect email or password.',
    'auth/email-already-in-use':     'An account with this email already exists.',
    'auth/weak-password':            'Password must be at least 6 characters.',
    'auth/too-many-requests':        'Too many failed attempts. Please try again later.',
    'auth/network-request-failed':   'Network error. Check your connection and try again.',
  };

  // If the code is not in our map, show a generic fallback message
  return map[code] || 'Something went wrong. Please try again.';
}


// ── LOGIN ───────────────────────────────────────────────────
document.getElementById('loginSubmitBtn').addEventListener('click', async function () {

  // Step 1 — read values
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Step 2 — clear previous errors before fresh validation
  clearAuthErrors();

  // Step 3 — client-side validation (before hitting Firebase)
  let hasError = false;

  if (!email) {
    showFieldError('loginEmail', 'loginEmailError', 'Email is required.');
    hasError = true;
  } else if (!email.includes('@')) {
    showFieldError('loginEmail', 'loginEmailError', 'Enter a valid email address.');
    hasError = true;
  }

  if (!password) {
    showFieldError('loginPassword', 'loginPasswordError', 'Password is required.');
    hasError = true;
  }

  if (hasError) return;

  // Step 4 — disable button while Firebase call is in flight
  this.disabled    = true;
  this.textContent = 'Signing in...';

  // Step 5 — call Firebase
  try {
    const { signInWithEmailAndPassword, auth } = window._firebase;
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged (below) handles everything after successful login

  } catch (error) {
    // Step 6 — show the human-readable error
    showGeneralError('loginError', translateAuthError(error.code));

  } finally {
    // Step 7 — always re-enable the button whether success or failure
    this.disabled    = false;
    this.textContent = 'Login';
  }
});


// ── REGISTER ────────────────────────────────────────────────
document.getElementById('registerSubmitBtn').addEventListener('click', async function () {

  const email    = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirm  = document.getElementById('registerConfirm').value;

  clearAuthErrors();

  let hasError = false;

  if (!email) {
    showFieldError('registerEmail', 'registerEmailError', 'Email is required.');
    hasError = true;
  } else if (!email.includes('@')) {
    showFieldError('registerEmail', 'registerEmailError', 'Enter a valid email address.');
    hasError = true;
  }

  if (!password) {
    showFieldError('registerPassword', 'registerPasswordError', 'Password is required.');
    hasError = true;
  } else if (password.length < 6) {
    showFieldError('registerPassword', 'registerPasswordError', 'Password must be at least 6 characters.');
    hasError = true;
  }

  if (!confirm) {
    showFieldError('registerConfirm', 'registerConfirmError', 'Please confirm your password.');
    hasError = true;
  } else if (password !== confirm) {
    showFieldError('registerConfirm', 'registerConfirmError', 'Passwords do not match.');
    hasError = true;
  }

  if (hasError) return;

  this.disabled    = true;
  this.textContent = 'Creating account...';

  try {
    const { createUserWithEmailAndPassword, auth } = window._firebase;
    await createUserWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles everything after successful registration

  } catch (error) {
    showGeneralError('registerError', translateAuthError(error.code));

  } finally {
    this.disabled    = false;
    this.textContent = 'Create Account';
  }
});


// ── LOGOUT ──────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', async function () {
  const { signOut, auth } = window._firebase;

  try {
    await signOut(auth);
    // onAuthStateChanged handles UI update after signout

  } catch (error) {
    console.error('Logout error:', error);
  }
});


// ── AUTH STATE LISTENER ─────────────────────────────────────
// This is the most important function in the auth system.
function initAuthListener () {
  const { onAuthStateChanged, auth } = window._firebase;

onAuthStateChanged(auth, function (user) {

    // Always hide the loading screen first — Firebase has responded,
    // so we no longer need to block the UI regardless of auth state
    document.getElementById('loadingScreen').style.display = 'none';

    if (user) {
      // ── USER IS LOGGED IN ──────────────────────────────────

      // Overlay stays hidden (it starts hidden now)
      document.getElementById('authOverlay').style.display = 'none';

      // Show user info in the sidebar
      document.getElementById('userInfoPanel').style.display  = 'block';
      document.getElementById('userEmailDisplay').textContent = user.email;

      // Fetch role from Firestore and apply to sidebar immediately.
      fetchAndApplyRole(user.uid);

      // Fetch Remote Config flags and apply feature visibility.
      // Runs in parallel — no need to await either of these.
      initRemoteConfig();

      // Start the app
      initApp();

    } else {
      // ── USER IS LOGGED OUT ─────────────────────────────────

      // Now show the auth overlay — user needs to log in
      document.getElementById('authOverlay').style.display = 'flex';

      // Hide user info panel
      document.getElementById('userInfoPanel').style.display = 'none';

      // Clear the email display
      document.getElementById('userEmailDisplay').textContent = '';
    }
  });
}


// ── LIVE ERROR CLEARING ON INPUT ────────────────────────────

['loginEmail', 'loginPassword'].forEach(id => {
  document.getElementById(id).addEventListener('input', function () {
    clearFieldError(id, id + 'Error');
    document.getElementById('loginError').style.display = 'none';
  });
});

['registerEmail', 'registerPassword', 'registerConfirm'].forEach(id => {
  document.getElementById(id).addEventListener('input', function () {
    clearFieldError(id, id + 'Error');
    document.getElementById('registerError').style.display = 'none';
  });
});




//===========================================
// REMOTE CONFIG MODULE
//===========================================

// ── APPLY REMOTE CONFIG FLAGS ───────────────────────────────

function applyRemoteConfig () {
  if (!window._firebase) return;

  const { remoteConfig, getValue } = window._firebase;

  // ── FEATURE FLAGS ──────────────────────────────────────────

  const featureFlags = [
    { key: 'show_savings',        btnId: 'savingsBtn'        },
    { key: 'show_refinancing',    btnId: 'refinanceBtn'      },
    { key: 'show_extra_payment',  btnId: 'extraPaymentBtn'   },
    { key: 'show_loan_comparison',btnId: 'loanComparisonBtn' },
    { key: 'show_emi_chart',      btnId: 'emiChartBtn'       },
    { key: 'show_export_schedule',btnId: 'exportScheduleBtn' },
    { key: 'show_pdf_download',   btnId: 'pdfDownloadBtn'    },
  ];

  featureFlags.forEach(({ key, btnId }) => {
    const isEnabled = getValue(remoteConfig, key).asBoolean();
    const btn       = document.getElementById(btnId);

    if (!btn) return;

    if (!isEnabled) {
      // RC says feature is off — hide completely regardless of role
      btn.style.display = 'none';
    }
    // If isEnabled is true, we do NOT force display:flex here.
    // The role system already controls visibility for enabled features.
    // Forcing display here would break role-based hiding for free users.
  });

  // ── APP NOTICE ─────────────────────────────────────────────
  // If the app_notice string is non-empty, show the banner.
  // To show a notice: set app_notice to your message in the console.
  // To hide it: set app_notice back to empty string.
  const notice     = getValue(remoteConfig, 'app_notice').asString().trim();
  const noticeDiv  = document.getElementById('appNotice');
  const noticeText = document.getElementById('appNoticeText');

  if (notice && noticeDiv && noticeText) {
    noticeText.textContent  = notice;
    noticeDiv.style.display = 'block';
  } else if (noticeDiv) {
    noticeDiv.style.display = 'none';
  }
}


// ── FETCH AND APPLY REMOTE CONFIG ───────────────────────────
// fetchAndActivate does two things in one call:
//   1. fetch  — downloads the latest config from Firebase servers
//   2. activate — makes the fetched values available via getValue()
// After it resolves, we call applyRemoteConfig to use the values.

async function initRemoteConfig () {
  if (!window._firebase) return;

  const { remoteConfig, fetchAndActivate, getValue } = window._firebase;

  // ── IN-APP DEFAULTS ────────────────────────────────────────
  // These are fallback values used if:
  //   - The fetch fails (offline, timeout)
  //   - A key exists in code but not yet in the Firebase Console
  // Always define defaults for every key you use.
  remoteConfig.defaultConfig = {
    show_savings:         true,
    show_refinancing:     true,
    show_extra_payment:   true,
    show_loan_comparison: true,
    show_emi_chart:       true,
    show_export_schedule: true,
    show_pdf_download:    true,
    app_notice:           ''
  };

  try {
    await fetchAndActivate(remoteConfig);
    console.log('Remote Config fetched successfully');
  } catch (err) {
    // Non-blocking — if fetch fails, defaultConfig values are used.
    // The app continues normally with all features enabled by default.
    console.warn('Remote Config fetch failed — using defaults:', err.message);
  }

  // Apply regardless of whether fetch succeeded or failed.
  // If fetch failed, getValue returns the defaultConfig values.
  applyRemoteConfig();
}



//===========================================
// ANALYTICS MODULE
//===========================================

// ── ANALYTICS HELPER ────────────────────────────────────────
function trackEvent (eventName, params = {}) {
  try {
    if (!window._firebase || !window._firebase.analytics) return;
    const { analytics, logEvent } = window._firebase;
    logEvent(analytics, eventName, params);
  } catch (err) {
    // Silent fail — never let analytics crash the app
    console.warn('Analytics error:', err.message);
  }
}


//===========================================
// ROLES MODULE
//===========================================

// ── ROLE CONSTANTS ──────────────────────────────────────────
const ROLE_FREE  = 'free';
const ROLE_ADMIN = 'admin';


// ── APPLY ROLE TO UI ────────────────────────────────────────

function applyRoleToUI (role) {

  const isAdmin = role === ROLE_ADMIN;

  // Select every menu button that has a data-role attribute
  const menuButtons = document.querySelectorAll('.menu-item[data-role]');

  menuButtons.forEach(btn => {
    const requiredRole = btn.getAttribute('data-role');

    if (requiredRole === ROLE_FREE) {
      // Free buttons are always visible to everyone
      btn.style.display = 'flex';

    } else if (requiredRole === ROLE_ADMIN) {
      // Admin buttons are only visible to admins
      btn.style.display = isAdmin ? 'flex' : 'none';
    }
  });

  // Update the role badge in the user info panel
  const roleDisplay = document.getElementById('userRoleDisplay');
  if (roleDisplay) {
    roleDisplay.textContent  = isAdmin ? 'Admin'        : 'Free Account';
    roleDisplay.style.color  = isAdmin ? 'rgb(255,200,0)' : 'rgb(0,200,80)';
  }
}


// ── FETCH USER ROLE ─────────────────────────────────────────

async function fetchAndApplyRole (userId) {

  const { db, doc, getDoc, setDoc } = window._firebase;

  try {
    const snapshot = await getDoc(doc(db, 'users', userId));

    if (snapshot.exists() && snapshot.data().role) {
      // Role already set — just apply it
      const role = snapshot.data().role;
      applyRoleToUI(role);

    } else {
      // Brand new user or missing role field — assign 'free' as default
      // merge:true so we do not overwrite their loanInputs field
      await setDoc(
        doc(db, 'users', userId),
        { role: ROLE_FREE },
        { merge: true }
      );
      applyRoleToUI(ROLE_FREE);
    }

  } catch (err) {
    // If Firestore fails, default to free to avoid exposing premium features
    console.warn('Role fetch failed — defaulting to free:', err.message);
    applyRoleToUI(ROLE_FREE);
  }
}


// ── GUARD FUNCTION ──────────────────────────────────────────
async function checkAccess () {

  const { db, doc, getDoc, auth } = window._firebase;
  const user = auth.currentUser;

  if (!user) return false;

  try {
    const snapshot = await getDoc(doc(db, 'users', user.uid));

    if (snapshot.exists() && snapshot.data().role === ROLE_ADMIN) {
      return true;
    }

    // User is free — show an upgrade message
    showAccessDenied();
    return false;

  } catch (err) {
    console.warn('Access check failed:', err.message);
    return false;
  }
}


// ── ACCESS DENIED MESSAGE ───────────────────────────────────

function showAccessDenied () {
  // Reuse existing result-box style — no new HTML element needed
  let toast = document.getElementById('accessToast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'accessToast';
    toast.className = 'access-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = '🔒 This feature is available for Premium users only.';
  toast.style.opacity = '1';
  toast.style.bottom  = '30px';

  // Auto-hide after 3 seconds
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.bottom  = '10px';
  }, 3000);
}

// ── FIREBASE READY LISTENER ─────────────────────────────────

window.addEventListener('firebaseReady', function () {
  initAuthListener();
});
