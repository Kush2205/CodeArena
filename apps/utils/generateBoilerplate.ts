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
        'long long':'long long', 
        'int[]':'vector<int>', 'float[]':'vector<float>',
        'double[]':'vector<double>', 'string[]':'vector<string>', 'bool[]':'vector<bool>',
        'int[][]':'vector<vector<int>>', 'float[][]':'vector<vector<float>>',
        'double[][]':'vector<vector<double>>', 'string[][]':'vector<vector<string>>', 'bool[][]':'vector<vector<bool>>',
        TreeNode: 'TreeNode*', ListNode: 'ListNode*',
        AdjacencyMatrix: 'vector<vector<int>>', AdjacencyList: 'vector<vector<int>>'
    };
    const argsList = inputs.map(i => {
        const typeStr = cppTypeMap[i.type] || i.type;
        return typeStr.startsWith('vector') || typeStr.includes('*') ? `${typeStr}& ${i.name}` : `${typeStr} ${i.name}`;
    }).join(', ');

    const returnTypeStr = cppTypeMap[returnType] || 'void';

    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');
    const hasVector = inputs.some(i => i.type.includes('[]')) || output.some(o => o.type.includes('[]'));
    const hasString = inputs.some(i => i.type === 'string') || output.some(o => o.type === 'string');

    let includes = '';
    let structs = '';
    if (hasTree) {
        structs += `// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n`;
    }
    if (hasList) {
        structs += `// struct ListNode {\n//     int val;\n//     ListNode *next;\n//     ListNode(int x) : val(x), next(nullptr) {}\n// };\n\n`;
    }
    return `${structs}class Solution {
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
        'bool[]': 'List[bool]',
        'int[][]': 'List[List[int]]',
        'float[][]': 'List[List[float]]',
        'double[][]': 'List[List[float]]',
        'string[][]': 'List[List[str]]',
        'bool[][]': 'List[List[bool]]',
        'TreeNode': 'Optional[TreeNode]',
        'ListNode': 'Optional[ListNode]',
        'AdjacencyMatrix': 'List[List[int]]',
        'AdjacencyList': 'List[List[int]]',
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
        if (i.type.endsWith('[]') || i.type === 'AdjacencyMatrix' || i.type === 'AdjacencyList') imports.add('List');
        if (i.type === 'TreeNode' || i.type === 'ListNode') imports.add('Optional');
    });
    if (output.some(o => o.type === 'TreeNode' || o.type === 'ListNode')) imports.add('Optional');
    if (returnType.endsWith('[]') || returnType === 'AdjacencyMatrix' || returnType === 'AdjacencyList') imports.add('List');
    if (returnTypeString === 'Any') imports.add('Any');
    
    const importLine = imports.size > 0 ? `from typing import ${Array.from(imports).join(', ')}\n\n` : '';

    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');

    let classes = '';
    if (hasTree) {
        classes += `# class TreeNode:\n#     def __init__(self, val: int = 0, left: Optional['TreeNode'] = None, right: Optional['TreeNode'] = None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n`;
    }
    if (hasList) {
        classes += `# class ListNode:\n#     def __init__(self, val: int = 0, next: Optional['ListNode'] = None):\n#         self.val = val\n#         self.next = next\n\n`;
    }

    return `${classes}class Solution:\n    def ${functionName}(self, ${inputParams}) -> ${returnTypeString}:\n        # User Code Starts\n\n        # User Code Ends`;
}



// Java
function generateJavaBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'void';

    const javaTypeMap: Record<string,string> = {
        int:'int', float:'float', double:'double', string:'String', bool:'boolean', char:'char',
        'long long':'long', 
        'int[]':'int[]', 'float[]':'float[]', 'double[]':'double[]', 'string[]':'String[]', 'bool[]':'boolean[]',
        'int[][]':'int[][]', 'float[][]':'float[][]', 'double[][]':'double[][]', 'string[][]':'String[][]', 'bool[][]':'boolean[][]',
        TreeNode: 'TreeNode', ListNode: 'ListNode', AdjacencyMatrix: 'int[][]', AdjacencyList: 'List<List<Integer>>'
    };

    const argsList = inputs.map(i => `${javaTypeMap[i.type] || i.type} ${i.name}`).join(', ');
    const returnTypeStr = javaTypeMap[returnType] || 'void';

    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');
    const hasAdjList = inputs.some(i => i.type === 'AdjacencyList') || output.some(o => o.type === 'AdjacencyList');

    let classes = '';
    if (hasTree) {
        classes += `// class TreeNode {\n//     int val;\n//     TreeNode left;\n//     TreeNode right;\n//     TreeNode(int val) { this.val = val; }\n// }\n\n`;
    }
    if (hasList) {
        classes += `// class ListNode {\n//     int val;\n//     ListNode next;\n//     ListNode(int val) { this.val = val; }\n// }\n\n`;
    }
    return `${classes}class Solution {\n    public ${returnTypeStr} ${functionName}(${argsList}) {\n        // User Code Starts\n\n        // User Code Ends\n    }\n}`;
}

// C
function generateCBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'void';

    const cTypeMap: Record<string, string> = {
        int:'int', float:'float', double:'double', string:'char*', bool:'bool', char:'char',
        'long long':'long long', 
        'int[]':'int*', 'float[]':'float*', 'double[]':'double*', 'string[]':'char**', 'bool[]':'bool*',
        'int[][]':'int**', 'float[][]':'float**', 'double[][]':'double**', 'string[][]':'char***', 'bool[][]':'bool**',
        TreeNode: 'struct TreeNode*', ListNode: 'struct ListNode*',
        AdjacencyMatrix: 'int**', AdjacencyList: 'int**'
    };

    // For array return types in C, we need a returnSize parameter
    const needsReturnSize = returnType.endsWith('[]');
    const argsListParts = inputs.map(i => {
        const cType = cTypeMap[i.type] || i.type;
        // For graphs and arrays, we need to pass size parameter
        if (i.type === 'AdjacencyMatrix') return `${cType} ${i.name}, int n`;
        if (i.type === 'AdjacencyList') return `${cType} ${i.name}, int n`;
        if (i.type.endsWith('[]') && cType.includes('*')) return `${cType} ${i.name}, int ${i.name}Size`;
        return `${cType} ${i.name}`;
    });
    if (needsReturnSize) {
        argsListParts.push('int* returnSize');
    }
    const argsList = argsListParts.join(', ');
    const returnTypeStr = cTypeMap[returnType] || 'void';

    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');

    let structs = '';
    if (hasTree) {
        structs += `// struct TreeNode {\n//     int val;\n//     struct TreeNode *left;\n//     struct TreeNode *right;\n// };\n\n`;
    }
    if (hasList) {
        structs += `// struct ListNode {\n//     int val;\n//     struct ListNode *next;\n// };\n\n`;
    }
    return `${structs}${returnTypeStr} ${functionName}(${argsList}) {\n    // User Code Starts\n\n    // User Code Ends\n}`;
}

// JavaScript
function generateJavascriptBoilerplate(problem: Problem): string {
    const { functionName, inputs } = problem;
    const argsList = inputs.map(i => i.name).join(', ');

    const hasTree = inputs.some(i => i.type === 'TreeNode') || problem.output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || problem.output.some(o => o.type === 'ListNode');

    let classes = '';
    if (hasTree) {
        classes += `// class TreeNode {\n//     constructor(val = 0, left = null, right = null) {\n//         this.val = val;\n//         this.left = left;\n//         this.right = right;\n//     }\n// }\n\n`;
    }
    if (hasList) {
        classes += `// class ListNode {\n//     constructor(val = 0, next = null) {\n//         this.val = val;\n//         this.next = next;\n//     }\n// }\n\n`;
    }
    return `${classes}class Solution {
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
    fs.writeFileSync(path.join(outputDir, 'solution.c'), generateCBoilerplate(problem));

    console.log(`✅ Generated editor boilerplates for: ${problem.problemName}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('📄 Files: solution.cpp, solution.py, Solution.java, solution.js, solution.c');
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
