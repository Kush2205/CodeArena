import fs from 'fs';
import path from 'path';

interface Field {
    name: string;
    type: string;
}

interface Problem {
    problemName: string;
    functionName: string;
    inputs: Field[];
    output: Field[];
}

// Parse Structure.md to extract problem info
function parseFileStructure(filepath: string): Problem {
    const fileContent = fs.readFileSync(filepath, 'utf8');
    const lines = fileContent.split('\n');

    let problemName = '';
    let functionName = '';
    let inputs: Field[] = [];
    let output: Field[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('Problem Name :')) {
            problemName = trimmedLine.split(':')[1].trim();
        } else if (trimmedLine.startsWith('Function Name :')) {
            functionName = trimmedLine.split(':')[1].trim();
        } else if (trimmedLine.startsWith('Input Field:')) {
            const parts = trimmedLine.split(':')[1].trim().split(' ');
            if (parts.length >= 2) inputs.push({ type: parts[0], name: parts[1] });
        } else if (trimmedLine.startsWith('Output Field:')) {
            const parts = trimmedLine.split(':')[1].trim().split(' ');
            if (parts.length >= 2) output.push({ type: parts[0], name: parts[1] });
        }
    }

    return { problemName, functionName, inputs, output };
}

// -------------------- Editor-side Boilerplate --------------------

// C++
function generateCppBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'void';

    const cppTypeMap: Record<string, string> = {
        int:'int', float:'float', double:'double', string:'string', bool:'bool', char:'char',
        'long long':'long long', 'int[]':'vector<int>', 'float[]':'vector<float>',
        'double[]':'vector<double>', 'string[]':'vector<string>'
    };
    const argsList = inputs.map(i => {
        const typeStr = cppTypeMap[i.type] || i.type;
        return typeStr.startsWith('vector') ? `${typeStr}& ${i.name}` : `${typeStr} ${i.name}`;
    }).join(', ');

    const returnTypeStr = cppTypeMap[returnType] || 'void';

    return `class Solution {
public:
    ${returnTypeStr} ${functionName}(${argsList}) {
        // User Code Starts

        // User Code Ends
    }
};`;
}

// Python
function generatePythonBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;

    // Map problem input/output types to Python types
    const pyTypeMap: Record<string, string> = {
        'int': 'int',
        'float': 'float',
        'double': 'float',
        'string': 'str',
        'bool': 'bool',
        'char': 'str',
        'int[]': 'List[int]',
        'float[]': 'List[float]',
        'double[]': 'List[float]',
        'string[]': 'List[str]',
        // fallback
        'any': 'Any'
    };

    const returnType = output.length > 0 ? output[0].type : 'None';
    const returnTypeString = pyTypeMap[returnType] || 'Any';

    // Prepare input parameters with type hints
    const inputParams = inputs.map(input => {
        const pyType = pyTypeMap[input.type] || 'Any';
        return `${input.name}: ${pyType}`;
    }).join(', ');

    // Collect required imports
    const imports = new Set<string>();
    inputs.forEach(i => {
        if (i.type.endsWith('[]')) imports.add('List');
    });
    if (!pyTypeMap[returnType].startsWith('List') && returnTypeString === 'Any') imports.add('Any');
    
    const importLine = imports.size > 0 ? `from typing import ${Array.from(imports).join(', ')}\n\n` : '';

    return `${importLine}class Solution:
    def ${functionName}(self, ${inputParams}) -> ${returnTypeString}:
        # User Code Starts

        # User Code Ends
        pass
`;
}



// Java
function generateJavaBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'void';

    const javaTypeMap: Record<string,string> = {
        int:'int', float:'float', double:'double', string:'String', bool:'boolean', char:'char',
        'long long':'long', 'int[]':'int[]', 'float[]':'float[]', 'double[]':'double[]', 'string[]':'String[]'
    };

    const argsList = inputs.map(i => `${javaTypeMap[i.type] || i.type} ${i.name}`).join(', ');
    const returnTypeStr = javaTypeMap[returnType] || 'void';

    return `class Solution {
    public ${returnTypeStr} ${functionName}(${argsList}) {
        // User Code Starts

        // User Code Ends
    }
}`;
}

// JavaScript
function generateJavascriptBoilerplate(problem: Problem): string {
    const { functionName, inputs } = problem;
    const argsList = inputs.map(i => i.name).join(', ');

    return `class Solution {
    ${functionName}(${argsList}) {
        // User Code Starts

        // User Code Ends
    }
}`;
}

// -------------------- Generate and Write Files --------------------
function generateBoilerplateFiles(problem: Problem, outputDir: string) {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'solution.cpp'), generateCppBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'solution.py'), generatePythonBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'Solution.java'), generateJavaBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'solution.js'), generateJavascriptBoilerplate(problem));

    console.log(`✅ Generated editor boilerplates for: ${problem.problemName}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('📄 Files: solution.cpp, solution.py, Solution.java, solution.js');
}

// -------------------- Main --------------------
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: bun run generateBoilerplate.ts <problem-name> [output-dir]');
        process.exit(1);
    }

    const problemName = args[0];
    const outputDir = args[1] || path.join(__dirname, '..', 'problems', problemName, 'boilerplate-editor');

    const structureFilePath = path.join(__dirname, '..', 'problems', problemName, 'Structure.md');
    if (!fs.existsSync(structureFilePath)) {
        console.error(`❌ Structure.md not found: ${structureFilePath}`);
        process.exit(1);
    }

    const problem = parseFileStructure(structureFilePath);
    generateBoilerplateFiles(problem, outputDir);
}

main();
