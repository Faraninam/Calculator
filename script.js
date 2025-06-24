const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const themeToggle = document.getElementById('theme-toggle');

let current = '';
let operator = '';
let operand = '';
let resultShown = false;

function updateDisplay(value) {
    display.textContent = value.length ? value : '0';
}

function calculate(a, op, b) {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b === 0 ? 'Error' : a / b;
        case '%': return a % b;
        default: return b;
    }
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => handleInput(btn.getAttribute('data-value')));
});

function handleInput(value) {
    if (!isNaN(value)) {
        if (resultShown) {
            current = value;
            resultShown = false;
        } else {
            if (current === '0') current = '';
            current += value;
        }
        updateDisplay(current);
    } else if (value === '.') {
        if (!current.includes('.')) {
            current += current ? '.' : '0.';
            updateDisplay(current);
        }
    } else if (value === 'C') {
        current = '';
        operator = '';
        operand = '';
        updateDisplay('0');
    } else if (value === '⌫') {
        current = current.slice(0, -1);
        updateDisplay(current);
    } else if (value === '=') {
        if (operator && operand !== '' && current !== '') {
            let result = calculate(operand, operator, current);
            updateDisplay(result.toString());
            current = result.toString();
            operator = '';
            operand = '';
            resultShown = true;
        }
    } else if (['+', '-', '*', '/', '%'].includes(value)) {
        if (operator && current !== '') {
            operand = calculate(operand, operator, current).toString();
            updateDisplay(operand);
            current = '';
        } else if (current !== '') {
            operand = current;
            current = '';
        }
        operator = value;
        resultShown = false;
    }
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        handleInput(e.key);
    } else if (['+', '-', '*', '/', '%'].includes(e.key)) {
        handleInput(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        handleInput('=');
    } else if (e.key === 'Backspace') {
        handleInput('⌫');
    } else if (e.key.toLowerCase() === 'c') {
        handleInput('C');
    }
});

// Theme toggle logic
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    if (document.body.classList.contains('light')) {
        themeToggle.textContent = '🌞 Light Mode';
    } else {
        themeToggle.textContent = '🌙 Dark Mode';
    }
});

// Copy result on click
display.addEventListener('click', () => {
    navigator.clipboard.writeText(display.textContent);
    display.classList.add('copied');
    setTimeout(() => display.classList.remove('copied'), 500);
});