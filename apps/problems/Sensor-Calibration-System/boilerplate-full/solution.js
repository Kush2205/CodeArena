const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const line_nums = inputLines[0].trim();
const nums = line_nums ? line_nums.split(/\s+/).map(x => parseInt(x)) : [];
const k = parseInt(inputLines[1]);
const solution = new Solution();
const result = solution.minChanges(nums, k);
console.log(result);