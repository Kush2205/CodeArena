#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateMergeSortedListsTestCases() {
    const testCasesDir = path.join(__dirname, 'test_cases');
    
    if (!fs.existsSync(testCasesDir)) {
        fs.mkdirSync(testCasesDir, { recursive: true });
    }

    const testSizes = [
        [10, 10], [20, 20], [30, 30], [40, 40], [50, 50],
        [60, 60], [70, 70], [80, 80], [90, 90], [100, 100],
        [150, 50], [100, 100], [120, 80], [160, 40], [180, 20],
        [190, 10], [195, 5]
    ];
    
    for (let i = 0; i < testSizes.length; i++) {
        const [m, n] = testSizes[i];
        generateTestCase(i + 3, m, n);
    }
    
    // Test cases 18-19: Large arrays to cause TLE for O(n²) solutions
    generateLargeTestCase(18, 10000, 10000); // 20k total elements
    generateLargeTestCase(19, 15000, 15000); // 30k total elements

    console.log('✅ Generated 20 test cases for Merge-Sorted-Lists (0-19)');
}

function generateTestCase(caseNum, m, n) {
    const list1 = [];
    const list2 = [];
    
    let current = Math.floor(Math.random() * 100);
    for (let i = 0; i < m; i++) {
        list1.push(current);
        current += Math.floor(Math.random() * 10) + 1;
    }
    
    current = Math.floor(Math.random() * 100);
    for (let i = 0; i < n; i++) {
        list2.push(current);
        current += Math.floor(Math.random() * 10) + 1;
    }
    
    const merged = [...list1, ...list2].sort((a, b) => a - b);
    
    const inputPath = path.join(__dirname, 'test_cases', `${caseNum}.in.txt`);
    const inputContent = `${formatArray(list1)}\n${formatArray(list2)}\n`;
    fs.writeFileSync(inputPath, inputContent);
    
    const outputPath = path.join(__dirname, 'test_cases', `${caseNum}.out.txt`);
    const outputContent = `${formatArray(merged)}\n`;
    fs.writeFileSync(outputPath, outputContent);
    
    console.log(`Generated test case ${caseNum}: m=${m}, n=${n}, total=${m + n}`);
}

function formatArray(arr) {
    if (arr.length === 0) return '';
    return arr.join(' ');
}

function generateLargeTestCase(caseNum, m, n) {
    const inputPath = path.join(__dirname, 'test_cases', `${caseNum}.in.txt`);
    const outputPath = path.join(__dirname, 'test_cases', `${caseNum}.out.txt`);
    
    const inputStream = fs.createWriteStream(inputPath);
    const outputStream = fs.createWriteStream(outputPath);
    
    // Generate and write list1
    let current1 = 0;
    const list1 = [];
    for (let i = 0; i < m; i++) {
        if (i > 0) inputStream.write(' ');
        inputStream.write(current1.toString());
        list1.push(current1);
        current1 += Math.floor(Math.random() * 10) + 1;
    }
    inputStream.write('\n');
    
    // Generate and write list2
    let current2 = 0;
    const list2 = [];
    for (let i = 0; i < n; i++) {
        if (i > 0) inputStream.write(' ');
        inputStream.write(current2.toString());
        list2.push(current2);
        current2 += Math.floor(Math.random() * 10) + 1;
    }
    inputStream.write('\n');
    inputStream.end();
    
    // Merge arrays using two-pointer approach and write directly
    let i = 0, j = 0, count = 0;
    
    while (i < m && j < n) {
        if (count > 0) outputStream.write(' ');
        if (list1[i] <= list2[j]) {
            outputStream.write(list1[i].toString());
            i++;
        } else {
            outputStream.write(list2[j].toString());
            j++;
        }
        count++;
    }
    
    while (i < m) {
        if (count > 0) outputStream.write(' ');
        outputStream.write(list1[i].toString());
        i++;
        count++;
    }
    
    while (j < n) {
        if (count > 0) outputStream.write(' ');
        outputStream.write(list2[j].toString());
        j++;
        count++;
    }
    
    outputStream.write('\n');
    outputStream.end();
    
    console.log(`Generated LARGE test case ${caseNum}: m=${m}, n=${n}, total=${m + n}`);
}

generateMergeSortedListsTestCases();
