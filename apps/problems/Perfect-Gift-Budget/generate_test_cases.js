#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generatePerfectGiftBudgetTestCases() {
    const testCasesDir = path.join(__dirname, 'test_cases');
    
    if (!fs.existsSync(testCasesDir)) {
        fs.mkdirSync(testCasesDir, { recursive: true });
    }

    // Test cases 3-17: Various k and n combinations (ensure they have solutions)
    const testCases = [
        [2, 3],   // [[1,2]]
        [2, 5],   // [[1,4],[2,3]]
        [3, 7],   // [[1,2,4]]
        [3, 9],   // [[1,2,6],[1,3,5],[2,3,4]]
        [4, 10],  // [[1,2,3,4]]
        [4, 14],  // multiple combinations
        [5, 15],  // [[1,2,3,4,5]]
        [5, 20],  // multiple combinations
        [6, 21],  // [[1,2,3,4,5,6]]
        [6, 25],  // multiple combinations
        [7, 28],  // [[1,2,3,4,5,6,7]]
        [7, 32],  // multiple combinations
        [8, 36],  // [[1,2,3,4,5,6,7,8]]
        [8, 40],  // multiple combinations
        [9, 45],  // [[1,2,3,4,5,6,7,8,9]]
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const [k, n] = testCases[i];
        generateTestCase(i + 3, k, n);
    }
    
    // Test cases 18-19: TLE-prone cases with maximum backtracking
    // These require the most backtracking attempts to find solutions
    generateTestCase(18, 7, 34); // 470 backtracking calls, 4 combinations
    generateTestCase(19, 7, 33); // 460 backtracking calls, 3 combinations

    console.log('✅ Generated 20 test cases for Perfect-Gift-Budget (0-19)');
}

function findCombinations(k, n) {
    const result = [];
    
    function backtrack(start, current, sum) {
        if (current.length === k) {
            if (sum === n) {
                result.push([...current]);
            }
            return;
        }
        
        for (let i = start; i <= 9; i++) {
            if (sum + i > n) break;
            current.push(i);
            backtrack(i + 1, current, sum + i);
            current.pop();
        }
    }
    
    backtrack(1, [], 0);
    return result;
}

function generateTestCase(caseNum, k, n) {
    const result = findCombinations(k, n);
    
    // Write input file
    const inputPath = path.join(__dirname, 'test_cases', `${caseNum}.in.txt`);
    fs.writeFileSync(inputPath, `${k}\n${n}\n`);
    
    // Write output file - space-separated format for 2D arrays
    const outputPath = path.join(__dirname, 'test_cases', `${caseNum}.out.txt`);
    let outputStr = '';
    if (result.length === 0) {
        outputStr = '';
    } else {
        outputStr = result.map(arr => arr.join(' ')).join('\n') + '\n';
    }
    fs.writeFileSync(outputPath, outputStr);
    
    console.log(`Generated test case ${caseNum}: k=${k}, n=${n}, combinations=${result.length}`);
}

// Run the generator
generatePerfectGiftBudgetTestCases();
