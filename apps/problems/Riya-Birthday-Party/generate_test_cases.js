#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateBirthdayPartyTestCases() {
    const testCasesDir = path.join(__dirname, 'test_cases');
    
    if (!fs.existsSync(testCasesDir)) {
        fs.mkdirSync(testCasesDir, { recursive: true });
    }

    // Test cases 3-22: Various graph configurations
    const sizes = [5, 6, 10, 15, 20, 30, 50, 75, 100, 200, 300, 500, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000];
    
    for (let i = 0; i < sizes.length; i++) {
        generateTestCase(i + 3, sizes[i]);
    }
    
    // Test cases 23-24: Maximum size for TLE detection
    generateTestCase(23, 100000); // 10^5 maximum constraint
    generateTestCase(24, 100000); // 10^5 maximum constraint

    console.log('✅ Generated 25 test cases for Riya-Birthday-Party');
}

function generateTestCase(caseNum, n) {
    const favorite = new Array(n);
    
    // Strategy: Create a mix of cycles and chains
    // Some cycles of length 2, some longer cycles, some chains
    
    for (let i = 0; i < n; i++) {
        let fav;
        do {
            fav = Math.floor(Math.random() * n);
        } while (fav === i);
        favorite[i] = fav;
    }
    
    // Calculate the actual answer
    const result = calculateMaximumInvitations(favorite);
    
    // Write input file - space-separated
    const inputPath = path.join(__dirname, 'test_cases', `${caseNum}.in.txt`);
    fs.writeFileSync(inputPath, `${favorite.join(' ')}\n`);
    
    // Write output file
    const outputPath = path.join(__dirname, 'test_cases', `${caseNum}.out.txt`);
    fs.writeFileSync(outputPath, `${result}\n`);
    
    console.log(`Generated test case ${caseNum}: n=${n}, result=${result}`);
}

function calculateMaximumInvitations(favorite) {
    const n = favorite.length;
    const visited = new Array(n).fill(false);
    const inCycle = new Array(n).fill(false);
    let maxCycleLen = 0;
    let totalChainLen = 0;
    
    // Find all cycles
    for (let i = 0; i < n; i++) {
        if (visited[i]) continue;
        
        const path = [];
        const posMap = new Map();
        let curr = i;
        
        while (!visited[curr] && !posMap.has(curr)) {
            posMap.set(curr, path.length);
            path.push(curr);
            curr = favorite[curr];
        }
        
        if (posMap.has(curr)) {
            // Found a cycle
            const cycleStart = posMap.get(curr);
            const cycleLen = path.length - cycleStart;
            
            // Mark cycle nodes
            for (let j = cycleStart; j < path.length; j++) {
                inCycle[path[j]] = true;
            }
            
            if (cycleLen === 2) {
                // For 2-cycles, we can extend with chains
                const a = path[cycleStart];
                const b = path[cycleStart + 1];
                const chainA = getChainLength(favorite, a, inCycle);
                const chainB = getChainLength(favorite, b, inCycle);
                totalChainLen += 2 + chainA + chainB;
            } else if (cycleLen > maxCycleLen) {
                maxCycleLen = cycleLen;
            }
        }
        
        // Mark all nodes in path as visited
        for (const node of path) {
            visited[node] = true;
        }
    }
    
    return Math.max(maxCycleLen, totalChainLen);
}

function getChainLength(favorite, node, inCycle) {
    let len = 0;
    const reverse = new Map();
    
    for (let i = 0; i < favorite.length; i++) {
        if (!reverse.has(favorite[i])) {
            reverse.set(favorite[i], []);
        }
        reverse.get(favorite[i]).push(i);
    }
    
    const queue = [node];
    const visited = new Set([node]);
    
    while (queue.length > 0) {
        const curr = queue.shift();
        const prev = reverse.get(curr) || [];
        
        for (const p of prev) {
            if (!inCycle[p] && !visited.has(p)) {
                visited.add(p);
                queue.push(p);
                len = Math.max(len, getDepth(favorite, p, node));
            }
        }
    }
    
    return len;
}

function getDepth(favorite, start, target) {
    let depth = 0;
    let curr = start;
    while (curr !== target) {
        curr = favorite[curr];
        depth++;
    }
    return depth;
}

// Run the generator
generateBirthdayPartyTestCases();
