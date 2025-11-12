const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const line_favorite = inputLines[0].trim();
const favorite = line_favorite ? line_favorite.split(/\s+/).map(x => parseInt(x)) : [];
const solution = new Solution();
const result = solution.maximumInvitations(favorite);
console.log(result);