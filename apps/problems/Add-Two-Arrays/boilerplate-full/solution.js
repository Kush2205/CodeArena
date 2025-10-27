// User Code Starts

// User Code Ends

const fs = require('fs');
const inputRaw = fs.readFileSync(0, 'utf-8').trim().replace(/^"|"$/g, '');
const tokens = inputRaw.length ? inputRaw.split(/\s+/) : [];

const a = tokens[0].split(' ').map(x => parseInt(x));
const b = tokens[1].split(' ').map(x => parseInt(x));

const solution = new Solution();
const result = solution.addTwoArrays(a, b);
console.log(result.join(' '));
