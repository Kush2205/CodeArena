// User Code Starts

// User Code Ends

const fs = require('fs');
const inputRaw = fs.readFileSync(0, 'utf-8').trim().replace(/^"|"$/g, '');
const inputLines = inputRaw.split('\n').map(line => line.trim()).filter(line => line);

const arr = inputLines[0].split(/\s+/).map(x => parseInt(x));

const solution = new Solution();
const result = solution.sumOfArray(arr);
console.log(result);
