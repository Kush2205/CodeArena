const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const line_a = inputLines[0].trim();
const a = line_a ? line_a.split(/\s+/).map(x => parseInt(x)) : [];
const line_b = inputLines[1].trim();
const b = line_b ? line_b.split(/\s+/).map(x => parseInt(x)) : [];
const solution = new Solution();
const result = solution.addTwoArrays(a, b);
console.log(result.join(' '));