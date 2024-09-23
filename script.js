// Create calculator UI
const calculator = document.getElementById('calculator');
calculator.className = 'calculator';

// Create display
const display = document.createElement('input');
display.type = 'text';
display.id = 'display';
display.disabled = true;
calculator.appendChild(display);

// Create button layout with a decimal button added
const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '.', '0', '=', '+',
    'C',
];

const buttonContainer = document.createElement('div');
buttonContainer.className = 'buttons';
calculator.appendChild(buttonContainer);

// Create buttons
buttons.forEach(value => {
    const button = document.createElement('button');
    button.textContent = value;

    // Assign classes based on button type
    if (value === 'C') {
        button.classList.add('clear');
    } else if (value === '=') {
        button.classList.add('equals');
    } else if (['/', '*', '-', '+'].includes(value)) {
        button.classList.add('operator');
    } else {
        button.classList.add('number');
    }

    button.onclick = () => handleButtonClick(value);
    buttonContainer.appendChild(button);
});

// Handle button click events
function handleButtonClick(value) {
    if (value === 'C') {
        display.value = '';
    } else if (value === '=') {
        try {
            display.value = calculate(display.value);
        } catch (error) {
            display.value = 'Error';
        }
    } else {
        const lastChar = display.value[display.value.length - 1];
        const isLastCharOperator = ['+', '-', '*', '/'].includes(lastChar);

        if (value === '.') {
            if (isLastCharOperator || display.value === '') {
                return; // Do not add a decimal
            }
            const lastNumber = display.value.split(/[\+\-\*\/]/).pop();
            if (lastNumber.includes('.')) {
                return; // Do not add another decimal
            }
        }
        display.value += value;
    }
}

// Updated calculate function to handle decimals and rounding
function calculate(expression) {
    const tokens = expression.match(/(\d*\.?\d+|[+\-*/])/g); // Match numbers with decimals and operators
    const numbers = [];
    const operators = [];

    for (let token of tokens) {
        if (!isNaN(token)) {
            numbers.push(parseFloat(token)); // Convert to float to handle decimals
        } else {
            while (operators.length && precedence(operators[operators.length - 1]) >= precedence(token)) {
                const operator = operators.pop();
                const right = numbers.pop();
                const left = numbers.pop();
                numbers.push(applyOperator(left, right, operator));
            }
            operators.push(token);
        }
    }

    while (operators.length) {
        const operator = operators.pop();
        const right = numbers.pop();
        const left = numbers.pop();
        numbers.push(applyOperator(left, right, operator));
    }

    // Round the result to 2 decimal places
    return parseFloat(numbers[0].toFixed(2)); // Convert back to float after rounding
}

function precedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
}

function applyOperator(left, right, operator) {
    switch (operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/':
            if (right === 0) throw new Error('Division by zero');
            return left / right;
        default: return 0;
    }
}

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');

// Check for saved user preference and set initial theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
}

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Keyboard functionality
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        handleButtonClick(key);
    } else if (key === 'Enter' || key === '=') {
        handleButtonClick('=');
    } else if (key === 'Backspace' || key.toUpperCase() === 'C') {
        handleButtonClick('C');
    } else if (['+', '-', '*', '/'].includes(key)) {
        handleButtonClick(key);
    } else if (key === '.') {
        handleButtonClick('.');
    }
});