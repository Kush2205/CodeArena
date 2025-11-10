#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateOrganizationalHierarchyTestCases() {
    const testCasesDir = path.join(__dirname, 'test_cases');
    
    if (!fs.existsSync(testCasesDir)) {
        fs.mkdirSync(testCasesDir, { recursive: true });
    }

    // Test cases 3-17: Various tree sizes and shapes
    generateTestCase(3, 3);   // Small tree
    generateTestCase(4, 7);   // Medium tree
    generateTestCase(5, 15);  // Larger tree
    generateTestCase(6, 10);  
    generateTestCase(7, 20);  
    generateTestCase(8, 31);  // Perfect binary tree height 4
    generateTestCase(9, 25);  
    generateTestCase(10, 40); 
    generateTestCase(11, 50); 
    generateTestCase(12, 63); // Perfect binary tree height 5
    generateTestCase(13, 70); 
    generateTestCase(14, 80); 
    generateTestCase(15, 90); 
    generateTestCase(16, 100);
    generateTestCase(17, 150);
    
    // Test cases 18-19: Large trees for TLE detection
    generateTestCase(18, 1000); // 1000 nodes
    generateTestCase(19, 1000); // 1000 nodes

    console.log('✅ Generated 20 test cases for Organizational-Hierarchy (0-19)');
}

function generateTestCase(caseNum, numNodes) {
    if (numNodes === 0) {
        fs.writeFileSync(path.join(__dirname, 'test_cases', `${caseNum}.in.txt`), '\n');
        fs.writeFileSync(path.join(__dirname, 'test_cases', `${caseNum}.out.txt`), '\n');
        return;
    }
    
    // Generate tree array representation
    const tree = [];
    for (let i = 0; i < numNodes; i++) {
        tree.push(Math.floor(Math.random() * 2001) - 1000); // -1000 to 1000
    }
    
    // Add some nulls randomly to make tree incomplete
    for (let i = Math.floor(numNodes / 2); i < numNodes; i++) {
        if (Math.random() < 0.3) {
            tree[i] = null;
        }
    }
    
    // Calculate level order traversal
    const result = calculateLevelOrder(tree);
    
    // Write input file - space-separated with null as string
    const inputPath = path.join(__dirname, 'test_cases', `${caseNum}.in.txt`);
    const inputStr = tree.map(val => val === null ? 'null' : val).join(' ');
    fs.writeFileSync(inputPath, `${inputStr}\n`);
    
    // Write output file - each level on a new line, values space-separated
    const outputPath = path.join(__dirname, 'test_cases', `${caseNum}.out.txt`);
    const outputStr = result.map(level => level.join(' ')).join('\n') + '\n';
    fs.writeFileSync(outputPath, outputStr);
    
    console.log(`Generated test case ${caseNum}: numNodes=${numNodes}, levels=${result.length}`);
}

function calculateLevelOrder(tree) {
    if (!tree || tree.length === 0 || tree[0] === null) {
        return [];
    }
    
    const result = [];
    const queue = [[0, 0]]; // [index, level]
    
    while (queue.length > 0) {
        const [idx, level] = queue.shift();
        
        if (idx >= tree.length || tree[idx] === null) {
            continue;
        }
        
        if (!result[level]) {
            result[level] = [];
        }
        
        result[level].push(tree[idx]);
        
        // Add left child
        queue.push([2 * idx + 1, level + 1]);
        // Add right child
        queue.push([2 * idx + 2, level + 1]);
    }
    
    return result;
}

// Run the generator
generateOrganizationalHierarchyTestCases();
