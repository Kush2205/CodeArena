const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const list1 = inputLines[0].trim().split(/\s+/).map(parseInt);
const list2 = inputLines[1].trim().split(/\s+/).map(parseInt);
const solution = new Solution();
const result = solution.mergeSortedLists(list1, list2);
console.log(result.join(' '));