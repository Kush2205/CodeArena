const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const arr = inputLines[0].trim().split(/\s+/).map(parseInt);
const solution = new Solution();
const result = solution.countEvenNumbers(arr);
console.log(result);