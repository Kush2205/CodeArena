const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const k = parseInt(inputLines[0]);
const n = parseInt(inputLines[1]);
const solution = new Solution();
const result = solution.findGiftCombinations(k, n);
console.log(result.join(' '));