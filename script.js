const displayEl = document.getElementById('display');
const keys = document.querySelector('.keys');

let expression = '';
let lastWasEval = false;

const allowedChars = /^[0-9+\-*/.%() ]+$/;

function updateDisplay(text) {
  displayEl.textContent = text === '' ? '0' : text;
}

function safeAppend(value) {
  if (lastWasEval && /[0-9.]/.test(value)) {
    expression = '';
    lastWasEval = false;
  }

  if (value === '.') {
    const parts = expression.split(/[\+\-\*\/\%]/);
    const last = parts[parts.length - 1];
    if (last.includes('.')) return;
    if (last === '') expression += '0';
  }

  if (value === '0') {
    const prevChar = expression.slice(-1);
    if (prevChar === '0') {
      const parts = expression.split(/[\+\-\*\/\%]/);
      const last = parts[parts.length - 1];
      if (last === '0') return;
    }
  }

  expression += value;
}

function evaluateExpression(expr) {
  const normalized = expr.replace(/×/g, '*').replace(/÷/g, '/');
  if (!allowedChars.test(normalized)) {
    throw new Error('Invalid characters in expression');
  }
  if (/[*\/]{2,}/.test(normalized)) {
    throw new Error('Invalid operator sequence');
  }
  if (normalized.length > 120) throw new Error('Expression too long');

  const result = Function('"use strict"; return (' + normalized + ')')();
  if (!isFinite(result)) throw new Error('Math error');
  return result;
}

keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const val = btn.getAttribute('data-value');
  const action = btn.getAttribute('data-action');

  if (action === 'clear') {
    expression = '';
    updateDisplay('0');
    lastWasEval = false;
    return;
  }
  if (action === 'back') {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
    lastWasEval = false;
    return;
  }
  if (action === 'equals') {
    try {
      const result = evaluateExpression(expression || '0');
      expression = String(result);
      updateDisplay(expression);
      lastWasEval = true;
    } catch (err) {
      updateDisplay('Error');
      expression = '';
      lastWasEval = false;
    }
    return;
  }

  if (val) {
    const map = { '÷':'/', '×':'*', '−':'-' };
    const toAdd = map[val] || val;

    if (/[\+\-\*\/\%]/.test(toAdd)) {
      if (expression === '' && toAdd !== '-') return;
      if (/[\+\-\*\/\%]$/.test(expression)) {
        expression = expression.slice(0, -1) + toAdd;
        updateDisplay(expression);
        return;
      }
    }

    safeAppend(toAdd);
    updateDisplay(expression);
  }
});

document.addEventListener('keydown', (e) => {
  const key = e.key;

  if (/^[0-9+\-*/.%()]$/.test(key)) {
    safeAppend(key);
    updateDisplay(expression);
    return;
  }

  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    try {
      const result = evaluateExpression(expression || '0');
      expression = String(result);
      updateDisplay(expression);
      lastWasEval = true;
    } catch (err) {
      updateDisplay('Error');
      expression = '';
      lastWasEval = false;
    }
    return;
  }

  if (key === 'Backspace') {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
    return;
  }

  if (key === 'Delete' || key === 'Escape') {
    expression = '';
    updateDisplay('0');
    lastWasEval = false;
    return;
  }
});
