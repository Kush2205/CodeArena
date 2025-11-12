const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const line_arr = inputLines[0].trim();
const arr = line_arr ? line_arr.split(/\s+/).map(x => parseInt(x)) : [];
const target = parseFloat(inputLines[1]);
const solution = new Solution();
const result = solution.subArraySum(arr, target);
console.log(result);