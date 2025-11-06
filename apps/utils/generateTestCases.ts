import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate only visible test cases (0, 1, 2) for database seeding
export function generateTestCases(problemName: string) {
   
    
    const testCasesDir = path.join(
        __dirname,
        "..",
        "problems",
        problemName,
        "test_cases"
    );

    console.log("Looking for test cases in:", testCasesDir);

    if (!fs.existsSync(testCasesDir)) {
        throw new Error(`Test cases directory not found: ${testCasesDir}`);
    }

    const testCases: { input: string; output: string }[] = [];

    // Only read test cases 0, 1, and 2 (visible test cases)
    const allowedTestCases = ['0', '1', '2'];
    
    for (const index of allowedTestCases) {
        const inFile = `${index}.in.txt`;
        const outFile = `${index}.out.txt`;
        
        const inFilePath = path.join(testCasesDir, inFile);
        const outFilePath = path.join(testCasesDir, outFile);
        
        // Only add if both files exist
        if (fs.existsSync(inFilePath) && fs.existsSync(outFilePath)) {
            const input = fs.readFileSync(inFilePath, 'utf-8').trim();
            const output = fs.readFileSync(outFilePath, 'utf-8').trim();
            testCases.push({ input, output });
            console.log(`✅ Loaded test case ${index} for ${problemName}`);
        } else {
            console.warn(`⚠️  Test case ${index} files not found for ${problemName}`);
        }
    }
    
    return testCases;
}

// Generate ALL test cases for judge submission (includes hidden test cases)
export function generateAllTestCases(problemName: string) {
    const testCasesDir = path.join(
        __dirname,
        "..",
        "problems",
        problemName,
        "test_cases"
    );

    console.log("Looking for ALL test cases in:", testCasesDir);

    if (!fs.existsSync(testCasesDir)) {
        throw new Error(`Test cases directory not found: ${testCasesDir}`);
    }

    const testCases: { input: string; output: string }[] = [];
    const files = fs.readdirSync(testCasesDir);
    
    // Get all input files and sort them numerically
    const inputFiles = files
        .filter(f => f.endsWith('.in.txt'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('.in.txt', ''));
            const numB = parseInt(b.replace('.in.txt', ''));
            return numA - numB;
        });
    
    for (const inFile of inputFiles) {
        const index = inFile.replace('.in.txt', '');
        const outFile = `${index}.out.txt`;
        
        if (files.includes(outFile)) {
            const inFilePath = path.join(testCasesDir, inFile);
            const outFilePath = path.join(testCasesDir, outFile);
            
            const input = fs.readFileSync(inFilePath, 'utf-8').trim();
            const output = fs.readFileSync(outFilePath, 'utf-8').trim();
            testCases.push({ input, output });
        }
    }
    
    console.log(`✅ Loaded ${testCases.length} test cases for judge submission: ${problemName}`);
    return testCases;
}