const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const a = inputLines[0].trim().split(/\s+/).map(parseInt);
const b = inputLines[1].trim().split(/\s+/).map(parseInt);
const solution = new Solution();
const result = solution.addTwoArrays(a, b);
console.log(result.join(' '));