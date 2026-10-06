// State
let calcHistory = [];
let calculationCount = 0;
let angleMode = 'deg';
let decimalPlaces = 2;

const display = document.getElementById('display');
const calcHistoryEl = document.getElementById('calcHistory');
const historyList = document.getElementById('historyList');

// Currency Exchange Rates (Updated)
const exchangeRates = {
  USD: 1,
  INR: 83.30,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156.80,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88
};

// Unit Conversion Factors (to base units)
const unitFactors = {
  length: {
    m: 1,
    km: 0.001,
    cm: 100,
    mm: 1000,
    mile: 0.000621371,
    yd: 1.09361,
    ft: 3.28084,
    in: 39.3701
  },
  weight: {
    kg: 1,
    g: 1000,
    mg: 1000000,
    lb: 2.20462,
    oz: 35.274,
    ton: 0.001
  },
  temperature: {
    c: (v) => v,
    f: (v) => (v * 9/5) + 32,
    k: (v) => v + 273.15
  }
};

// Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', function() {
    const tab = this.getAttribute('data-tab');
    switchTab(tab);
    
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  const activeTab = document.getElementById(tabName + 'Tab');
  if (activeTab) activeTab.classList.add('active');
  
  updatePageTitle(tabName);
}

function updatePageTitle(tab) {
  const titles = {
    calculator: { title: 'Calculator', subtitle: 'Basic arithmetic and scientific functions' },
    converter: { title: 'Currency Exchange', subtitle: 'Convert between different currencies' },
    units: { title: 'Unit Converter', subtitle: 'Convert length, weight, and temperature' },
    history: { title: 'Calculation History', subtitle: 'View all your calculations' },
    settings: { title: 'Settings', subtitle: 'Customize your calculator' }
  };
  
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  if (titles[tab]) {
    pageTitle.textContent = titles[tab].title;
    pageSubtitle.textContent = titles[tab].subtitle;
  }
}

// Calculator Functions
function appendValue(value) {
  if (display.value === '0' && !['+', '-', '*', '/', '.', '%'].includes(value)) {
    display.value = value;
  } else {
    display.value += value;
  }
}

function deleteLast() {
  display.value = display.value.slice(0, -1) || '0';
}

function clearDisplay() {
  display.value = '0';
  calcHistoryEl.textContent = '';
}

function clearAll() {
  display.value = '0';
  calcHistoryEl.textContent = '';
}

function calculate() {
  try {
    let expr = display.value;
    const originalExpr = expr;
    
    // Replace mathematical symbols
    expr = expr.replace(/×/g, '*')
               .replace(/÷/g, '/')
               .replace(/π/g, 'Math.PI')
               .replace(/e(?![a-zA-Z])/g, 'Math.E')
               .replace(/sin\(/g, (angleMode === 'deg' ? 'Math.sin(Math.PI/180*' : 'Math.sin('))
               .replace(/cos\(/g, (angleMode === 'deg' ? 'Math.cos(Math.PI/180*' : 'Math.cos('))
               .replace(/tan\(/g, (angleMode === 'deg' ? 'Math.tan(Math.PI/180*' : 'Math.tan('))
               .replace(/log\(/g, 'Math.log10(')
               .replace(/ln\(/g, 'Math.log(')
               .replace(/sqrt\(/g, 'Math.sqrt(')
               .replace(/\^2/g, '**2')
               .replace(/\^/g, '**')
               .replace(/%/g, '/100');
    
    if (!expr) return;
    
    const result = Function(`"use strict"; return (${expr});`)();
    
    if (!Number.isFinite(result)) {
      throw new Error('Invalid calculation');
    }
    
    const formattedResult = parseFloat(result.toFixed(decimalPlaces));
    
    calcHistoryEl.textContent = `${originalExpr} =`;
    display.value = formattedResult;
    
    // Add to history
    addToHistory(originalExpr, formattedResult);
    calculationCount++;
    document.getElementById('calcCount').textContent = calculationCount;
    document.getElementById('lastResult').textContent = formattedResult;
    
  } catch (e) {
    calcHistoryEl.textContent = 'Error';
    display.value = 'Error';
  }
}

function switchCalcMode(mode) {
  document.querySelectorAll('.calc-tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  document.querySelectorAll('.calc-mode').forEach(m => m.classList.remove('active'));
  document.getElementById(mode + 'Mode').classList.add('active');
}

// Currency Converter
function convertCurrency() {
  const amount = parseFloat(document.getElementById('amount').value) || 0;
  const from = document.getElementById('fromCurrency').value;
  const to = document.getElementById('toCurrency').value;
  
  const inUSD = amount / exchangeRates[from];
  const result = inUSD * exchangeRates[to];
  
  document.getElementById('convertedAmount').value = result.toFixed(2);
  document.getElementById('exchangeInfo').innerHTML = `
    <p>1 ${from} = ${(exchangeRates[to] / exchangeRates[from]).toFixed(4)} ${to}</p>
    <p class="text-muted">Last updated: Just now</p>
  `;
}

function swapCurrencies() {
  const from = document.getElementById('fromCurrency');
  const to = document.getElementById('toCurrency');
  const temp = from.value;
  from.value = to.value;
  to.value = temp;
  convertCurrency();
}

// Unit Converters
function convertLength() {
  const value = parseFloat(document.querySelector('.lengthFrom').value) || 0;
  const from = document.querySelector('.lengthFromUnit').value;
  const to = document.querySelector('.lengthToUnit').value;
  
  const meters = value / unitFactors.length[from];
  const result = meters * unitFactors.length[to];
  
  document.querySelector('.lengthTo').value = result.toFixed(6);
}

function convertWeight() {
  const value = parseFloat(document.querySelector('.weightFrom').value) || 0;
  const from = document.querySelector('.weightFromUnit').value;
  const to = document.querySelector('.weightToUnit').value;
  
  const kg = value / unitFactors.weight[from];
  const result = kg * unitFactors.weight[to];
  
  document.querySelector('.weightTo').value = result.toFixed(6);
}

function convertTemp() {
  const value = parseFloat(document.querySelector('.tempFrom').value) || 0;
  const from = document.querySelector('.tempFromUnit').value;
  const to = document.querySelector('.tempToUnit').value;
  
  let celsius;
  
  // Convert to Celsius
  if (from === 'c') celsius = value;
  else if (from === 'f') celsius = (value - 32) * 5/9;
  else if (from === 'k') celsius = value - 273.15;
  
  // Convert from Celsius
  let result;
  if (to === 'c') result = celsius;
  else if (to === 'f') result = (celsius * 9/5) + 32;
  else if (to === 'k') result = celsius + 273.15;
  
  document.querySelector('.tempTo').value = result.toFixed(2);
}

// History Management
function addToHistory(expression, result) {
  const item = {
    expression,
    result,
    time: new Date().toLocaleTimeString()
  };
  
  calcHistory.unshift(item);
  if (calcHistory.length > 50) calcHistory.pop();
  
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  if (calcHistory.length === 0) {
    historyList.innerHTML = '<p class="text-muted">No calculations yet</p>';
    return;
  }
  
  historyList.innerHTML = calcHistory.map((item, index) => `
    <div class="history-item">
      <div>
        <div>${item.expression}</div>
        <div style="color: var(--accent-primary); font-weight: 700;">${item.result}</div>
      </div>
      <div class="history-time">${item.time}</div>
    </div>
  `).join('');
}

function clearHistory() {
  calcHistory = [];
  calculationCount = 0;
  document.getElementById('calcCount').textContent = '0';
  document.getElementById('lastResult').textContent = '0';
  updateHistoryDisplay();
}

// Settings
document.getElementById('decimalPlaces').addEventListener('change', function() {
  decimalPlaces = parseInt(this.value);
  document.getElementById('decimalValue').textContent = decimalPlaces;
});

document.getElementById('angleMode').addEventListener('change', function() {
  angleMode = this.value;
});

document.getElementById('themeToggle').addEventListener('change', function() {
  document.body.classList.toggle('light-theme');
});

document.getElementById('themeSelect').addEventListener('change', function() {
  if (this.value === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('themeToggle').checked = false;
  } else {
    document.body.classList.remove('light-theme');
    document.getElementById('themeToggle').checked = true;
  }
});

// Keyboard Support
document.addEventListener('keydown', function(e) {
  if (/[0-9]/.test(e.key)) appendValue(e.key);
  else if (['+', '-', '*', '/'].includes(e.key)) appendValue(e.key);
  else if (e.key === '.') appendValue('.');
  else if (e.key === 'Enter') calculate();
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearDisplay();
});

// Time Display
function updateTime() {
  const now = new Date();
  const timeDisplay = document.getElementById('timeDisplay');
  timeDisplay.textContent = now.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  });
}

setInterval(updateTime, 1000);
updateTime();

// Real-time conversion listeners
document.getElementById('amount').addEventListener('input', convertCurrency);
document.getElementById('fromCurrency').addEventListener('change', convertCurrency);
document.getElementById('toCurrency').addEventListener('change', convertCurrency);

document.querySelector('.lengthFrom').addEventListener('input', convertLength);
document.querySelector('.lengthFromUnit').addEventListener('change', convertLength);
document.querySelector('.lengthToUnit').addEventListener('change', convertLength);

document.querySelector('.weightFrom').addEventListener('input', convertWeight);
document.querySelector('.weightFromUnit').addEventListener('change', convertWeight);
document.querySelector('.weightToUnit').addEventListener('change', convertWeight);

document.querySelector('.tempFrom').addEventListener('input', convertTemp);
document.querySelector('.tempFromUnit').addEventListener('change', convertTemp);
document.querySelector('.tempToUnit').addEventListener('change', convertTemp);

// Initialize
convertCurrency();
convertLength();
convertWeight();
convertTemp();
