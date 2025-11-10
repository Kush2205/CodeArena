const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const nums = inputLines[0].trim().split(/\s+/).map(parseInt);
const k = parseInt(inputLines[1]);
const solution = new Solution();
const result = solution.minChanges(nums, k);
console.log(result);