#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generatePerfectGiftBudgetTestCases() {
    const testCasesDir = path.join(__dirname, 'test_cases');
    
    if (!fs.existsSync(testCasesDir)) {
        fs.mkdirSync(testCasesDir, { recursive: true });
    }

    // Test cases 3-22: Various k and n combinations
    const testCases = [
        [2, 3], [2, 5], [3, 15], [4, 10], [5, 15],
        [5, 20], [6, 21], [6, 30], [7, 28], [7, 35],
        [8, 36], [8, 40], [9, 45], [9, 50], [9, 55],
        [9, 60], [8, 44], [7, 42], [6, 38], [5, 35]
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const [k, n] = testCases[i];
        generateTestCase(i + 3, k, n);
    }
    
    // Test cases 23-24: Complex backtracking scenarios
    generateTestCase(23, 9, 58); // Many combinations
    generateTestCase(24, 9, 59); // Many combinations

    console.log('✅ Generated 25 test cases for Perfect-Gift-Budget');
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
    const inputPath = path.join(__dirname, 'test_cases', `input_${caseNum}.txt`);
    fs.writeFileSync(inputPath, `${k}\n${n}\n`);
    
    // Write output file
    const outputPath = path.join(__dirname, 'test_cases', `output_${caseNum}.txt`);
    const outputStr = result.length === 0 ? '[]' : JSON.stringify(result);
    fs.writeFileSync(outputPath, `${outputStr}\n`);
    
    console.log(`Generated test case ${caseNum}: k=${k}, n=${n}, combinations=${result.length}`);
}

// Run the generator
generatePerfectGiftBudgetTestCases();
