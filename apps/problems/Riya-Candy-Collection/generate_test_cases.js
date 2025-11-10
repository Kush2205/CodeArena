#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateCandyCollectionTestCases() {
    const testCasesDir = path.join(__dirname, 'test_cases');
    
    if (!fs.existsSync(testCasesDir)) {
        fs.mkdirSync(testCasesDir, { recursive: true });
    }

    // Test cases 3-22: Various combinations
    for (let i = 3; i <= 22; i++) {
        generateTestCase(i);
    }
    
    // Test cases 23-24: Maximum length strings for TLE detection
    generateLargeTestCase(23, 10000000); // 10^7 length
    generateLargeTestCase(24, 10000000); // 10^7 length

    console.log('✅ Generated 25 test cases for Riya-Candy-Collection');
}

function generateTestCase(caseNum) {
    const favLength = Math.floor(Math.random() * 26) + 1; // 1-26 unique chars
    const candyLength = Math.floor(Math.random() * 50) + 1; // 1-50 chars
    
    // Generate unique favorites
    const allChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shuffled = allChars.split('').sort(() => Math.random() - 0.5);
    const favorites = shuffled.slice(0, favLength).join('');
    
    // Generate candies (random mix)
    let candies = '';
    let count = 0;
    for (let i = 0; i < candyLength; i++) {
        const char = allChars[Math.floor(Math.random() * allChars.length)];
        candies += char;
        if (favorites.includes(char)) count++;
    }
    
    // Write input file
    const inputPath = path.join(__dirname, 'test_cases', `${caseNum}.in.txt`);
    fs.writeFileSync(inputPath, `${favorites}\n${candies}\n`);
    
    // Write output file
    const outputPath = path.join(__dirname, 'test_cases', `${caseNum}.out.txt`);
    fs.writeFileSync(outputPath, `${count}\n`);
    
    console.log(`Generated test case ${caseNum}: favLen=${favLength}, candyLen=${candyLength}, result=${count}`);
}

function generateLargeTestCase(caseNum, length) {
    const inputPath = path.join(__dirname, 'test_cases', `${caseNum}.in.txt`);
    const outputPath = path.join(__dirname, 'test_cases', `${caseNum}.out.txt`);
    
    const inputStream = fs.createWriteStream(inputPath);
    
    // All lowercase letters as favorites (26 chars)
    const favorites = 'abcdefghijklmnopqrstuvwxyz';
    inputStream.write(favorites + '\n');
    
    // Generate large candy string (streaming)
    const allChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const chunkSize = 100000;
    let count = 0;
    
    for (let i = 0; i < length; i += chunkSize) {
        let chunk = '';
        const end = Math.min(i + chunkSize, length);
        for (let j = i; j < end; j++) {
            const char = allChars[Math.floor(Math.random() * allChars.length)];
            chunk += char;
            if (favorites.includes(char)) count++;
        }
        inputStream.write(chunk);
    }
    
    inputStream.write('\n');
    inputStream.end();
    
    // Write output
    fs.writeFileSync(outputPath, `${count}\n`);
    
    console.log(`Generated LARGE test case ${caseNum}: length=${length}, result=${count}`);
}

// Run the generator
generateCandyCollectionTestCases();
