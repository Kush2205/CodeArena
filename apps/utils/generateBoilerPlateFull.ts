// generateBoilerplateFull.ts
import fs from 'fs';
import path from 'path';

interface Problem {
    problemName: string;
    functionName: string;
    inputs: Array<{ name: string; type: string }>;
    output: Array<{ name: string; type: string }>;
}

function parseFileStructure(filepath: string): Problem {
    const fileContent = fs.readFileSync(filepath, 'utf8');
    const lines = fileContent.split('\n');

    let problemName = '';
    let functionName = '';
    let inputs: Array<{ name: string; type: string }> = [];
    let output: Array<{ name: string; type: string }> = [];

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

// ------------------- C++ Boilerplate -------------------
function generateCppFullBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'void';
    const cppTypeMap: Record<string, string> = {
        int: 'int', float: 'float', double: 'double', string: 'string', bool: 'bool',
        char: 'char', 'long long': 'long long', 'int[]': 'vector<int>', 'float[]': 'vector<float>',
        'double[]': 'vector<double>', 'string[]': 'vector<string>',
    };
    const returnTypeString = cppTypeMap[returnType] || returnType;

    const inputParsingCode = inputs.map(i => {
        const cppType = cppTypeMap[i.type] || i.type;
        if (cppType.startsWith('vector')) {
            const elementType = cppType.replace('vector<', '').replace('>', '');
            return `    vector<${elementType}> ${i.name};
    string line_${i.name};
    getline(cin, line_${i.name});
    istringstream iss_${i.name}(line_${i.name});
    ${elementType} num;
    while(iss_${i.name} >> num) ${i.name}.push_back(num);`;
        } else if (cppType === 'string') {
            return `    string ${i.name};\n    getline(cin, ${i.name});`;
        } else {
            return `    ${cppType} ${i.name};\n    cin >> ${i.name};`;
        }
    }).join('\n');

    const argsList = inputs.map(i => i.name).join(', ');
    const callPrefix = returnType === 'void' ? '' : `${returnTypeString} result = `;

    const outputCode = returnType === 'void' ? '' :
        returnType.endsWith('[]') || cppTypeMap[returnType].startsWith('vector') ?
        `    for(size_t i = 0; i < result.size(); i++){ if(i>0) cout<<" "; cout<<result[i]; }\n    cout<<endl;` :
        `    cout<<result<<endl;`;

    return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

// User Code Starts

// User Code Ends

int main(){
${inputParsingCode ? inputParsingCode + '\n' : ''}
    Solution solver;
    ${callPrefix}solver.${functionName}(${argsList});
${outputCode}
    return 0;
}`;
}

// ------------------- Python Boilerplate -------------------
function generatePythonFullBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'None';

    const pyTypeMap: Record<string, string> = {
        int: 'int', float: 'float', double: 'float', string: 'str', bool: 'bool',
        'int[]': 'List[int]', 'float[]': 'List[float]', 'double[]': 'List[float]', 'string[]': 'List[str]',
    };

    const needsTypingImport = inputs.some(i => i.type.endsWith('[]')) || returnType.endsWith('[]');

    const inputParsingCode = inputs.map(i => {
        if (i.type.endsWith('[]')) return `    ${i.name} = list(map(int, input().strip().split()))`;
        if (i.type === 'int') return `    ${i.name} = int(input())`;
        if (i.type === 'float' || i.type === 'double') return `    ${i.name} = float(input())`;
        return `    ${i.name} = input()`;
    }).join('\n');

    const argsList = inputs.map(i => i.name).join(', ');
    const outputCode = returnType === 'None' ? '' :
        returnType.endsWith('[]') ? `    print(' '.join(map(str, result)))` : `    print(result)`;

    return `${needsTypingImport ? 'from typing import List\n' : ''}# User Code Starts

# User Code Ends

if __name__ == "__main__":
${inputParsingCode || '    pass'}
    solver = Solution()
    ${returnType === 'None' ? '' : 'result = '}solver.${functionName}(${argsList})
${outputCode ? outputCode + '\n' : ''}`;
}

// ------------------- Java Boilerplate -------------------
function generateJavaFullBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'void';
    const javaTypeMap: Record<string, string> = {
        int: 'int', float: 'float', double: 'double', string: 'String', bool: 'boolean',
        char: 'char', 'long long': 'long', 'int[]': 'int[]', 'float[]': 'float[]', 'double[]': 'double[]',
        'string[]': 'String[]', 'bool[]': 'boolean[]', 'char[]': 'char[]',
    };
    const returnTypeString = javaTypeMap[returnType] || returnType;

    const inputParsingCode = inputs.map(i => {
        const javaType = javaTypeMap[i.type] || i.type;
        if (javaType.endsWith('[]')) {
            const elementType = javaType.replace('[]', '');
            const readMethod = elementType === 'String' ? 'nextLine' : elementType === 'int' ? 'nextInt' : 'next';
            return `        String line_${i.name} = scanner.nextLine();
        String[] tokens_${i.name} = line_${i.name}.trim().split("\\\\s+");
        ${javaType} ${i.name} = new ${elementType}[tokens_${i.name}.length];
        for(int i=0;i<tokens_${i.name}.length;i++){
            ${i.name}[i] = ${elementType==='String'?'tokens_'+i.name+'[i]':'Integer.parseInt(tokens_'+i.name+'[i])'};
        }`;
        } else if (javaType === 'String') return `        String ${i.name} = scanner.nextLine();`;
        else return `        ${javaType} ${i.name} = scanner.${javaType === 'int' ? 'nextInt()' : 'next'};`;
    }).join('\n');

    const argsList = inputs.map(i => i.name).join(', ');
    const outputCode = returnType === 'void' ? '' :
        returnType.endsWith('[]') ? `        for(int i=0;i<result.length;i++){ if(i>0) System.out.print(" "); System.out.print(result[i]); }\n        System.out.println();` :
        `        System.out.println(result);`;

    return `import java.util.*;

// User Code Starts

// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
${inputParsingCode ? inputParsingCode + '\n' : ''}
        Solution solver = new Solution();
        ${returnType === 'void' ? '' : `${returnTypeString} result = `}solver.${functionName}(${argsList});
${outputCode}
        scanner.close();
    }
}`;
}

// ------------------- JavaScript Boilerplate -------------------
function generateJavaScriptFullBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;

    const inputParsingCode = inputs.map((i, idx) => {
        if (i.type.endsWith('[]')) return `const ${i.name} = tokens[${idx}].split(' ').map(x => parseInt(x));`;
        if (['int', 'float', 'double'].includes(i.type)) return `const ${i.name} = parseInt(tokens[${idx}]);`;
        return `const ${i.name} = tokens[${idx}];`;
    }).join('\n');

    const argsList = inputs.map(i => i.name).join(', ');
    const isArrayReturn = output.length > 0 && output[0].type.endsWith('[]');
    const outputCode = isArrayReturn ? `console.log(result.join(' '));` : `console.log(result);`;

    return `// User Code Starts

// User Code Ends

const fs = require('fs');
const inputRaw = fs.readFileSync(0, 'utf-8').trim().replace(/^"|"$/g, '');
const tokens = inputRaw.length ? inputRaw.split(/\\s+/) : [];

${inputParsingCode ? inputParsingCode + '\n' : ''}
const solution = new Solution();
const result = solution.${functionName}(${argsList});
${outputCode}
`;
}

// ------------------- Main Generator -------------------
function generateBoilerplateFullFiles(problem: Problem, outputDir: string) {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'solution.cpp'), generateCppFullBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'solution.py'), generatePythonFullBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'Solution.java'), generateJavaFullBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'solution.js'), generateJavaScriptFullBoilerplate(problem));

    console.log(`✅ Generated Judge0-compatible boilerplate files for: ${problem.problemName}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('📄 Generated files: solution.cpp, solution.py, Solution.java, solution.js');
}

// ------------------- CLI Entry -------------------
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: bun run generateBoilerplateFull.ts <problem-name>');
        process.exit(1);
    }

    const problemName = args[0];
    const outputDir = path.join(__dirname, '..', 'problems', problemName, 'boilerplate-full');
    const structureFilePath = path.join(__dirname, '..', 'problems', problemName, 'Structure.md');

    if (!fs.existsSync(structureFilePath)) {
        console.error(`❌ Structure.md not found for problem: ${problemName}`);
        process.exit(1);
    }

    try {
        const problem = parseFileStructure(structureFilePath);
        generateBoilerplateFullFiles(problem, outputDir);
    } catch (err) {
        console.error('❌ Error generating boilerplate:', err);
        process.exit(1);
    }
}

main();
