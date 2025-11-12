const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const line_list1 = inputLines[0].trim();
const list1 = line_list1 ? line_list1.split(/\s+/).map(x => parseInt(x)) : [];
const line_list2 = inputLines[1].trim();
const list2 = line_list2 ? line_list2.split(/\s+/).map(x => parseInt(x)) : [];
const solution = new Solution();
const result = solution.mergeSortedLists(list1, list2);
console.log(result.join(' '));