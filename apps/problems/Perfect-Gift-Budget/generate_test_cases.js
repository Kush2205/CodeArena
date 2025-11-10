#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generatePerfectGiftBudgetTestCases() {
    const testCasesDir = path.join(__dirname, 'test_cases');
    
    if (!fs.existsSync(testCasesDir)) {
        fs.mkdirSync(testCasesDir, { recursive: true });
    }

    // Test cases 3-17: Various k and n combinations
    const testCases = [
        [2, 3], [2, 5], [3, 15], [4, 10], [5, 15],
        [5, 20], [6, 21], [6, 30], [7, 28], [7, 35],
        [8, 36], [8, 40], [9, 45], [9, 50], [9, 55]
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const [k, n] = testCases[i];
        generateTestCase(i + 3, k, n);
    }
    
    // Test cases 18-19: Complex backtracking scenarios
    generateTestCase(18, 9, 58); // Many combinations
    generateTestCase(19, 9, 59); // Many combinations

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
