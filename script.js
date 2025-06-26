const display = document.getElementById('display');
const miniDisplay = document.getElementById('mini-display');
const buttons = document.querySelectorAll('.btn');
const themeToggle = document.getElementById('theme-toggle');
const historyDiv = document.getElementById('history');
const memoryBtns = document.querySelectorAll('.memory');

let current = '';
let operator = '';
let operand = '';
let resultShown = false;
let expression = '';
let history = [];
let memory = 0;

function prettifyOperator(op) {
    switch (op) {
        case '/': return '÷';
        case '*': return '×';
        case '-': return '−';
        default: return op;
    }
}

function updateMiniDisplay() {
    // Only show the equation, not the answer/result
    let text = '';
    if (operand && operator) {
        text = operand + ' ' + prettifyOperator(operator) + (current ? ' ' + current : '');
    } else if (operator) {
        text = operand + ' ' + prettifyOperator(operator);
    } else if (operand) {
        text = operand;
    } else {
        text = '';
    }
    miniDisplay.textContent = text;
}

function updateDisplay(value) {
    display.textContent = value.length ? value : '0';
    updateMiniDisplay();
}

function addToHistory(expr, result) {
    if (!expr.trim()) return;
    history.unshift(`${expr} = ${result}`);
    if (history.length > 10) history.pop();
    historyDiv.innerHTML = history.map(h => `<div>${h}</div>`).join('');
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
    btn.addEventListener('click', () => {
        handleInput(btn.getAttribute('data-value'));
    });
});

memoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        handleMemory(btn.getAttribute('data-value'));
    });
});

function handleMemory(value) {
    if (value === 'MC') {
        memory = 0;
    } else if (value === 'MR') {
        current = memory.toString();
        updateDisplay(current);
    } else if (value === 'M+') {
        memory += parseFloat(display.textContent) || 0;
    } else if (value === 'M-') {
        memory -= parseFloat(display.textContent) || 0;
    }
}

function handleInput(value) {
    if (!isNaN(value)) {
        if (resultShown) {
            current = value;
            expression = value;
            resultShown = false;
        } else {
            if (current === '0') current = '';
            current += value;
            expression += value;
        }
        updateDisplay(current);
    } else if (value === '.') {
        if (!current.includes('.')) {
            current += current ? '.' : '0.';
            expression += current.length === 1 ? '.' : '';
            updateDisplay(current);
        }
    } else if (value === 'C') {
        current = '';
        operator = '';
        operand = '';
        expression = '';
        updateDisplay('0');
    } else if (value === '⌫') {
        current = current.slice(0, -1);
        expression = expression.slice(0, -1);
        updateDisplay(current);
    } else if (value === '±') {
        if (current) {
            if (current.startsWith('-')) current = current.slice(1);
            else current = '-' + current;
            updateDisplay(current);
        }
    } else if (value === '√') {
        if (current) {
            current = Math.sqrt(parseFloat(current)).toString();
            updateDisplay(current);
        }
    } else if (value === 'x²') {
        if (current) {
            current = (parseFloat(current) ** 2).toString();
            updateDisplay(current);
        }
    } else if (value === '1/x') {
        if (current && parseFloat(current) !== 0) {
            current = (1 / parseFloat(current)).toString();
            updateDisplay(current);
        }
    } else if (value === '%') {
        if (current) {
            current = (parseFloat(current) / 100).toString();
            updateDisplay(current);
        }
    } else if (value === '=') {
        if (operator && operand !== '' && current !== '') {
            let result = calculate(operand, operator, current);
            addToHistory(
                (operand + ' ' + prettifyOperator(operator) + ' ' + current),
                result
            );
            updateDisplay(result.toString());
            current = result.toString();
            operator = '';
            operand = '';
            resultShown = true;
        }
    } else if (['+', '-', '*', '/'].includes(value)) {
        if (operator && current !== '') {
            operand = calculate(operand, operator, current).toString();
            current = '';
            expression = operand + ' ' + value + ' ';
        } else if (current !== '') {
            operand = current;
            current = '';
            expression += ' ' + value + ' ';
        } else if (expression && /[+\-*/] $/.test(expression)) {
            expression = expression.slice(0, -3) + ' ' + value + ' ';
        }
        operator = value;
        resultShown = false;
    }
    updateMiniDisplay();
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
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
});

// Copy result on click
display.addEventListener('click', () => {
    navigator.clipboard.writeText(display.textContent);
    display.classList.add('copied');
    setTimeout(() => display.classList.remove('copied'), 500);
});