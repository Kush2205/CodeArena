const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const favorites = inputLines[0];
const candies = inputLines[1];
const solution = new Solution();
const result = solution.countFavoriteCandies(favorites, candies);
console.log(result);