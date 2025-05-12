const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const WINDOW_SIZE = 10;

const VALID_IDS = new Set(['p', 'f', 'e', 'r']);

const windows = {
  p: [],
  f: [],
  e: [],
  r: []
};
const mockNumbers = {
  p: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
  f: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34],    
  e: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  
  r: [5, 3, 9, 1, 7, 2, 6, 4, 8, 10]    
};

async function fetchNumbers(type) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNumbers[type] || []);
    }, 300);
  });
}

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!VALID_IDS.has(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
  }

  const window = windows[numberid];
  const windowPrevState = [...window];

  const start = Date.now();

  const fetchedNumbers = await fetchNumbers(numberid);
  const duration = Date.now() - start;

  if (duration > 500) {
    return res.json({
      windowPrevState,
      windowCurrState: window,
      numbers: [],
      avg: window.length ? (window.reduce((a, b) => a + b, 0) / window.length).toFixed(2) : 0
    });
  }

  const uniqueNewNumbers = fetchedNumbers.filter(num => !window.includes(num));
  const updatedWindow = [...window];

  uniqueNewNumbers.forEach(num => {
    if (!updatedWindow.includes(num)) {
      if (updatedWindow.length >= WINDOW_SIZE) {
        updatedWindow.shift();
      }
      updatedWindow.push(num);
    }
  });

  windows[numberid] = updatedWindow;

  const avg = updatedWindow.length
    ? (updatedWindow.reduce((a, b) => a + b, 0) / updatedWindow.length).toFixed(2)
    : 0;

  return res.json({
    windowPrevState,
    windowCurrState: updatedWindow,
    numbers: fetchedNumbers,
    avg: parseFloat(avg)
  });
});

app.listen(port, () => {
  console.log(`Average Calculator microservice running on http://localhost:${port}`);
});
