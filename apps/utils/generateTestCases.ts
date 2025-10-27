import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    const files = fs.readdirSync(testCasesDir);
    console.log("Files in test_cases directory:", files);

    
    const inputFiles = files.filter(f => f.endsWith('.in.txt')).sort();
    
    for (const inFile of inputFiles) {
        const index = inFile.replace('.in.txt', '');
        const outFile = `${index}.out.txt`;
        
        if (files.includes(outFile)) {
            const input = fs.readFileSync(path.join(testCasesDir, inFile), 'utf-8').trim();
            const output = fs.readFileSync(path.join(testCasesDir, outFile), 'utf-8').trim();
            testCases.push({ input, output });
        }
    }
    
    return testCases;
}