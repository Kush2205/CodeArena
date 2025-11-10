#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateSensorCalibrationTestCases() {
    const testCasesDir = path.join(__dirname, 'test_cases');
    
    if (!fs.existsSync(testCasesDir)) {
        fs.mkdirSync(testCasesDir, { recursive: true });
    }

    // Test cases 3-22: Various array sizes and k values
    const testCases = [
        [10, 2], [15, 3], [20, 4], [30, 5], [50, 2],
        [100, 3], [150, 4], [200, 5], [300, 10], [400, 8],
        [500, 6], [600, 7], [700, 9], [800, 11], [900, 12],
        [1000, 10], [1200, 15], [1400, 20], [1600, 25], [1800, 30]
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const [n, k] = testCases[i];
        generateTestCase(i + 3, n, k);
    }
    
    // Test cases 23-24: Maximum size for TLE detection
    generateTestCase(23, 2000, 50); // Maximum constraint
    generateTestCase(24, 2000, 100); // Maximum constraint

    console.log('✅ Generated 25 test cases for Sensor-Calibration-System');
}

function generateTestCase(caseNum, n, k) {
    const nums = [];
    for (let i = 0; i < n; i++) {
        nums.push(Math.floor(Math.random() * 1024)); // 0 to 2^10 - 1
    }
    
    // Calculate minimum changes needed
    const result = calculateMinChanges(nums, k);
    
    // Write input file - space-separated array
    const inputPath = path.join(__dirname, 'test_cases', `${caseNum}.in.txt`);
    fs.writeFileSync(inputPath, `${nums.join(' ')}\n${k}\n`);
    
    // Write output file
    const outputPath = path.join(__dirname, 'test_cases', `${caseNum}.out.txt`);
    fs.writeFileSync(outputPath, `${result}\n`);
    
    console.log(`Generated test case ${caseNum}: n=${n}, k=${k}, result=${result}`);
}

function calculateMinChanges(nums, k) {
    const n = nums.length;
    
    // Group elements by their position mod k
    const groups = Array.from({ length: k }, () => []);
    for (let i = 0; i < n; i++) {
        groups[i % k].push(nums[i]);
    }
    
    // For each group, find the most frequent value
    // The number of changes = total elements - most frequent count
    let totalChanges = 0;
    
    for (const group of groups) {
        if (group.length === 0) continue;
        
        const freq = new Map();
        let maxFreq = 0;
        
        for (const val of group) {
            freq.set(val, (freq.get(val) || 0) + 1);
            maxFreq = Math.max(maxFreq, freq.get(val));
        }
        
        totalChanges += group.length - maxFreq;
    }
    
    return totalChanges;
}

// Run the generator
generateSensorCalibrationTestCases();
