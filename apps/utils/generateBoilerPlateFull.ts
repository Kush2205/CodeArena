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
        TreeNode: 'TreeNode*', ListNode: 'ListNode*',
        AdjacencyMatrix: 'vector<vector<int>>', AdjacencyList: 'vector<vector<int>>',
    };
    const returnTypeString = cppTypeMap[returnType] || returnType;

    const inputParsingCode = inputs.map(i => {
        const cppType = cppTypeMap[i.type] || i.type;
        if (cppType === 'vector<vector<int>>' && i.type === 'AdjacencyMatrix') {
            return `    int size_${i.name};\n    cin >> size_${i.name};\n    vector<vector<int>> ${i.name}(size_${i.name}, vector<int>(size_${i.name}));\n    for(int i=0; i<size_${i.name}; i++) for(int j=0; j<size_${i.name}; j++) cin >> ${i.name}[i][j];`;
        } else if (cppType === 'vector<vector<int>>' && i.type === 'AdjacencyList') {
            return `    int vertices_${i.name};\n    cin >> vertices_${i.name};\n    vector<vector<int>> ${i.name}(vertices_${i.name});\n    string dummy;\n    getline(cin, dummy);\n    for(int i=0; i<vertices_${i.name}; i++) {\n        string line;\n        getline(cin, line);\n        istringstream iss(line);\n        int neighbor;\n        while(iss >> neighbor) ${i.name}[i].push_back(neighbor);\n    }`;
        } else if (cppType.startsWith('vector')) {
            const elementType = cppType.replace('vector<', '').replace('>', '');
            return `    vector<${elementType}> ${i.name};
    string line_${i.name};
    getline(cin, line_${i.name});
    istringstream iss_${i.name}(line_${i.name});
    ${elementType} num_${i.name};
    while(iss_${i.name} >> num_${i.name}) ${i.name}.push_back(num_${i.name});`;
        } else if (cppType === 'string') {
            return `    string ${i.name};\n    getline(cin, ${i.name});`;
        } else if (cppType === 'TreeNode*') {
            return `    string line_${i.name};\n    getline(cin, line_${i.name});\n    TreeNode* ${i.name} = buildTree(line_${i.name});`;
        } else if (cppType === 'ListNode*') {
            return `    string line_${i.name};\n    getline(cin, line_${i.name});\n    ListNode* ${i.name} = buildList(line_${i.name});`;
        } else {
            return `    ${cppType} ${i.name};\n    cin >> ${i.name};`;
        }
    }).join('\n');

    const argsList = inputs.map(i => i.name).join(', ');
    const functionArgsList = inputs.map(i => {
        const cppType = cppTypeMap[i.type] || i.type;
        return cppType.startsWith('vector') || cppType.includes('*') ? `${cppType} ${i.name}` : `${cppType} ${i.name}`;
    }).join(', ');
    
    const solutionCall = returnType === 'void' ? 
        `    Solution solver;\n    solver.${functionName}(${argsList});` :
        `    Solution solver;\n    ${returnTypeString} result = solver.${functionName}(${argsList});`;

    let structs = '';
    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');
    if (hasTree) {
        structs += `struct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\n`;
    }
    if (hasList) {
        structs += `struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\n`;
    }

    let helpers = '';
    if (hasTree) {
        helpers += `TreeNode* buildTree(string data) {\n    if (data.empty() || data == "null") return nullptr;\n    vector<string> tokens;\n    stringstream ss(data);\n    string token;\n    while (getline(ss, token, ',')) {\n        tokens.push_back(token);\n    }\n    // Trim whitespace from tokens\n    for (auto& t : tokens) {\n        t.erase(t.begin(), find_if(t.begin(), t.end(), [](int ch) { return !isspace(ch); }));\n        t.erase(find_if(t.rbegin(), t.rend(), [](int ch) { return !isspace(ch); }).base(), t.end());\n    }\n    if (tokens.empty() || tokens[0] == "null") return nullptr;\n    TreeNode* root = new TreeNode(stoi(tokens[0]));\n    queue<TreeNode*> q;\n    q.push(root);\n    size_t index = 1;\n    while (!q.empty() && index < tokens.size()) {\n        TreeNode* node = q.front();\n        q.pop();\n        if (index < tokens.size() && tokens[index] != "null") {\n            node->left = new TreeNode(stoi(tokens[index]));\n            q.push(node->left);\n        }\n        ++index;\n        if (index < tokens.size() && tokens[index] != "null") {\n            node->right = new TreeNode(stoi(tokens[index]));\n            q.push(node->right);\n        }\n        ++index;\n    }\n    return root;\n}\n\n`;
        helpers += `void printTree(TreeNode* root) {\n    if (!root) return;\n    queue<TreeNode*> q;\n    q.push(root);\n    vector<string> values;\n    while (!q.empty()) {\n        TreeNode* node = q.front();\n        q.pop();\n        if (node) {\n            values.push_back(to_string(node->val));\n            q.push(node->left);\n            q.push(node->right);\n        } else {\n            values.push_back("null");\n        }\n    }\n    while (!values.empty() && values.back() == "null") values.pop_back();\n    for (size_t i = 0; i < values.size(); ++i) {\n        if (i) cout << " ";\n        cout << values[i];\n    }\n    cout << endl;\n}\n\n`;
    }
    if (hasList) {
        helpers += `ListNode* buildList(string data) {\n    if (data.empty()) return nullptr;\n    vector<int> nums;\n    stringstream ss(data);\n    int num;\n    while (ss >> num) nums.push_back(num);\n    if (nums.empty()) return nullptr;\n    ListNode* head = new ListNode(nums[0]);\n    ListNode* tail = head;\n    for (size_t i = 1; i < nums.size(); ++i) {\n        tail->next = new ListNode(nums[i]);\n        tail = tail->next;\n    }\n    return head;\n}\n\n`;
        helpers += `void printList(ListNode* head) {\n    while (head) {\n        cout << head->val;\n        if (head->next) cout << " ";\n        head = head->next;\n    }\n    cout << endl;\n}\n\n`;
    }

    const outputCode = returnType === 'void' ? '' :
        returnType.endsWith('[]') || cppTypeMap[returnType].startsWith('vector') ?
        `    for(size_t i = 0; i < result.size(); i++){ if(i>0) cout<<" "; cout<<result[i]; }\n    cout<<endl;` :
        returnType === 'TreeNode' ? `    printTree(result);\n` :
        returnType === 'ListNode' ? `    printList(result);\n` :
        returnType === 'AdjacencyMatrix' || returnType === 'AdjacencyList' ? `    for(const auto& row : result) {\n        for(size_t i = 0; i < row.size(); ++i) {\n            if(i) cout << " ";\n            cout << row[i];\n        }\n        cout << endl;\n    }\n` :
        `    cout<<result<<endl;`;

    return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <queue>
#include <stack>
#include <deque>
#include <list>
#include <cmath>
#include <climits>
#include <cfloat>
#include <cstring>
#include <numeric>
#include <functional>
#include <bits/stdc++.h>
using namespace std;

${structs}${helpers}// User Code Starts
// User Code Ends

int main(){
${inputParsingCode ? inputParsingCode + '\n' : ''}
${solutionCall}
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
        TreeNode: 'Optional[TreeNode]', ListNode: 'Optional[ListNode]',
        AdjacencyMatrix: 'List[List[int]]', AdjacencyList: 'List[List[int]]',
    };

    const needsList = inputs.some(i => i.type.endsWith('[]') || i.type === 'AdjacencyMatrix' || i.type === 'AdjacencyList') || returnType.endsWith('[]') || returnType === 'AdjacencyMatrix' || returnType === 'AdjacencyList';
    const needsOptional = inputs.some(i => i.type === 'TreeNode' || i.type === 'ListNode') || returnType === 'TreeNode' || returnType === 'ListNode';
    
    let imports = 'from typing import ';
    const importTypes = [];
    if (needsOptional) importTypes.push('Optional');
    if (needsList) importTypes.push('List');
    imports += importTypes.join(', ');
    if (importTypes.length === 0) imports = '';
    else imports += '\n';

    const inputParsingCode = inputs.map(i => {
        if (i.type.endsWith('[]')) {
            const elementType = i.type.replace('[]', '');
            const mapFunc = elementType === 'int' ? 'int' : elementType === 'float' || elementType === 'double' ? 'float' : elementType === 'string' ? 'str' : 'str';
            return `    ${i.name} = list(map(${mapFunc}, input().strip().split()))`;
        }
        if (i.type === 'int') return `    ${i.name} = int(input())`;
        if (i.type === 'float' || i.type === 'double') return `    ${i.name} = float(input())`;
        if (i.type === 'TreeNode') return `    line = input().strip()\n    ${i.name} = build_tree(line)`;
        if (i.type === 'ListNode') return `    line = input().strip()\n    ${i.name} = build_list(line)`;
        if (i.type === 'AdjacencyMatrix') return `    n = int(input())\n    ${i.name} = [list(map(int, input().split())) for _ in range(n)]`;
        if (i.type === 'AdjacencyList') return `    vertices = int(input())\n    ${i.name} = [list(map(int, input().split())) for _ in range(vertices)]`;
        return `    ${i.name} = input()`;
    }).join('\n');

    const argsList = inputs.map(i => i.name).join(', ');
    const outputCode = returnType === 'None' ? '' :
        returnType.endsWith('[]') ? `    print(' '.join(map(str, result)))` :
        returnType === 'TreeNode' ? `    print_tree(result)` :
        returnType === 'ListNode' ? `    print_list(result)` :
        returnType === 'AdjacencyMatrix' || returnType === 'AdjacencyList' ? `    for row in result:\n        print(' '.join(map(str, row)))` :
        `    print(result)`;

    let classes = '';
    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');
    if (hasTree) {
        classes += `class TreeNode:\n    def __init__(self, val: int = 0, left: Optional['TreeNode'] = None, right: Optional['TreeNode'] = None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n`;
    }
    if (hasList) {
        classes += `class ListNode:\n    def __init__(self, val: int = 0, next: Optional['ListNode'] = None):\n        self.val = val\n        self.next = next\n\n`;
    }

    let helpers = '';
    if (hasTree) {
        helpers += `def build_tree(data: str) -> Optional[TreeNode]:\n    if not data or data == "null":\n        return None\n    tokens = data.split(',')\n    tokens = [t.strip() for t in tokens]\n    if not tokens or tokens[0] == "null":\n        return None\n    root = TreeNode(int(tokens[0]))\n    queue = [root]\n    i = 1\n    while queue and i < len(tokens):\n        node = queue.pop(0)\n        if i < len(tokens) and tokens[i] != "null":\n            node.left = TreeNode(int(tokens[i]))\n            queue.append(node.left)\n        i += 1\n        if i < len(tokens) and tokens[i] != "null":\n            node.right = TreeNode(int(tokens[i]))\n            queue.append(node.right)\n        i += 1\n    return root\n\n`;
        helpers += `def print_tree(root: Optional[TreeNode]) -> None:\n    if not root:\n        return\n    queue = [root]\n    values = []\n    while queue:\n        node = queue.pop(0)\n        if node:\n            values.append(str(node.val))\n            queue.append(node.left)\n            queue.append(node.right)\n        else:\n            values.append("null")\n    while values and values[-1] == "null":\n        values.pop()\n    print(' '.join(values))\n\n`;
    }
    if (hasList) {
        helpers += `def build_list(data: str) -> Optional[ListNode]:\n    if not data:\n        return None\n    nums = list(map(int, data.split()))\n    if not nums:\n        return None\n    head = ListNode(nums[0])\n    tail = head\n    for num in nums[1:]:\n        tail.next = ListNode(num)\n        tail = tail.next\n    return head\n\n`;
        helpers += `def print_list(head: Optional[ListNode]) -> None:\n    values = []\n    while head:\n        values.append(str(head.val))\n        head = head.next\n    print(' '.join(values))\n\n`;
    }

    return `${imports}${classes}${helpers}# User Code Starts\n# User Code Ends\n\nif __name__ == "__main__":\n${inputParsingCode || '    pass'}\n    solver = Solution()\n    ${returnType === 'None' ? '' : 'result = '}solver.${functionName}(${argsList})\n${outputCode ? outputCode + '\n' : ''}`;
}

// ------------------- Java Boilerplate -------------------
function generateJavaFullBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'void';
    const javaTypeMap: Record<string, string> = {
        int: 'int', float: 'float', double: 'double', string: 'String', bool: 'boolean',
        char: 'char', 'long long': 'long', 'int[]': 'int[]', 'float[]': 'float[]', 'double[]': 'double[]',
        'string[]': 'String[]', 'bool[]': 'boolean[]', 'char[]': 'char[]',
        TreeNode: 'TreeNode', ListNode: 'ListNode', AdjacencyMatrix: 'int[][]', AdjacencyList: 'List<List<Integer>>'
    };
    const returnTypeString = javaTypeMap[returnType] || returnType;

    const inputParsingCode = inputs.map(i => {
        const javaType = javaTypeMap[i.type] || i.type;
        if (javaType.endsWith('[]') && javaType !== 'int[][]') {
            const elementType = javaType.replace('[]', '');
            const readMethod = elementType === 'String' ? 'nextLine' : elementType === 'int' ? 'nextInt' : 'next';
            return `        String line_${i.name} = scanner.nextLine();
        String[] tokens_${i.name} = line_${i.name}.trim().split("\\\\s+");
        ${javaType} ${i.name} = new ${elementType}[tokens_${i.name}.length];
        for(int i=0;i<tokens_${i.name}.length;i++){
            ${i.name}[i] = ${elementType === 'String' ? 'tokens_' + i.name + '[i]' : elementType === 'int' ? 'Integer.parseInt(tokens_' + i.name + '[i])' : elementType === 'float' ? 'Float.parseFloat(tokens_' + i.name + '[i])' : elementType === 'double' ? 'Double.parseDouble(tokens_' + i.name + '[i])' : 'tokens_' + i.name + '[i]'};
        }`;
        } else if (javaType === 'String') return `        String ${i.name} = scanner.nextLine();`;
        else if (javaType === 'TreeNode') return `        String line_${i.name} = scanner.nextLine();\n        TreeNode ${i.name} = buildTree(line_${i.name});`;
        else if (javaType === 'ListNode') return `        String line_${i.name} = scanner.nextLine();\n        ListNode ${i.name} = buildList(line_${i.name});`;
        else if (javaType === 'int[][]') return `        int size_${i.name} = scanner.nextInt();\n        int[][] ${i.name} = new int[size_${i.name}][size_${i.name}];\n        for(int i=0; i<size_${i.name}; i++) for(int j=0; j<size_${i.name}; j++) ${i.name}[i][j] = scanner.nextInt();`;
        else if (javaType === 'List<List<Integer>>') return `        int vertices_${i.name} = scanner.nextInt();\n        List<List<Integer>> ${i.name} = new ArrayList<>();\n        scanner.nextLine(); // consume newline\n        for(int i=0; i<vertices_${i.name}; i++) {\n            String line = scanner.nextLine();\n            List<Integer> neighbors = new ArrayList<>();\n            for(String token : line.trim().split("\\\\s+")) neighbors.add(Integer.parseInt(token));\n            ${i.name}.add(neighbors);\n        }`;
        else return `        ${javaType} ${i.name} = scanner.${javaType === 'int' ? 'nextInt()' : javaType === 'double' ? 'nextDouble()' : javaType === 'float' ? 'nextFloat()' : javaType === 'long' ? 'nextLong()' : 'next()'};`;
    }).join('\n');

    const argsList = inputs.map(i => i.name).join(', ');
    const outputCode = returnType === 'void' ? '' :
        returnType === 'TreeNode' ? `        System.out.println(printTree(result));` :
        returnType === 'ListNode' ? `        System.out.println(printList(result));` :
        returnType === 'int[][]' ? `        for(int[] row : result){ for(int val : row) System.out.print(val + " "); System.out.println(); }` :
        returnType === 'List<List<Integer>>' ? `        for(List<Integer> list : result){ for(int val : list) System.out.print(val + " "); System.out.println(); }` :
        returnType.endsWith('[]') ? `        for(int i=0;i<result.length;i++){ if(i>0) System.out.print(" "); System.out.print(result[i]); }\n        System.out.println();` :
        `        System.out.println(result);`;

    let classes = '';
    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');
    if (hasTree) {
        classes += `class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode(int val) { this.val = val; }\n}\n\n`;
    }
    if (hasList) {
        classes += `class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int val) { this.val = val; }\n}\n\n`;
    }

    let helpers = '';
    if (hasTree) {
        helpers += `    static TreeNode buildTree(String data) {\n        if (data == null || data.equals("null")) return null;\n        String[] tokens = data.split(",");\n        for (int i = 0; i < tokens.length; i++) tokens[i] = tokens[i].trim();\n        if (tokens.length == 0 || tokens[0].equals("null")) return null;\n        TreeNode root = new TreeNode(Integer.parseInt(tokens[0]));\n        Queue<TreeNode> queue = new LinkedList<>();\n        queue.offer(root);\n        int i = 1;\n        while (!queue.isEmpty() && i < tokens.length) {\n            TreeNode node = queue.poll();\n            if (i < tokens.length && !tokens[i].equals("null")) {\n                node.left = new TreeNode(Integer.parseInt(tokens[i]));\n                queue.offer(node.left);\n            }\n            i++;\n            if (i < tokens.length && !tokens[i].equals("null")) {\n                node.right = new TreeNode(Integer.parseInt(tokens[i]));\n                queue.offer(node.right);\n            }\n            i++;\n        }\n        return root;\n    }\n\n`;
        helpers += `    static String printTree(TreeNode root) {\n        if (root == null) return "";\n        Queue<TreeNode> queue = new LinkedList<>();\n        queue.offer(root);\n        List<String> values = new ArrayList<>();\n        while (!queue.isEmpty()) {\n            TreeNode node = queue.poll();\n            if (node != null) {\n                values.add(String.valueOf(node.val));\n                queue.offer(node.left);\n                queue.offer(node.right);\n            } else {\n                values.add("null");\n            }\n        }\n        while (!values.isEmpty() && values.get(values.size() - 1).equals("null")) {\n            values.remove(values.size() - 1);\n        }\n        return String.join(" ", values);\n    }\n\n`;
    }
    if (hasList) {
        helpers += `    static ListNode buildList(String data) {\n        if (data == null || data.isEmpty()) return null;\n        String[] tokens = data.trim().split("\\\\s+");\n        if (tokens.length == 0) return null;\n        ListNode head = new ListNode(Integer.parseInt(tokens[0]));\n        ListNode tail = head;\n        for (int i = 1; i < tokens.length; i++) {\n            tail.next = new ListNode(Integer.parseInt(tokens[i]));\n            tail = tail.next;\n        }\n        return head;\n    }\n\n`;
        helpers += `    static String printList(ListNode head) {\n        List<String> values = new ArrayList<>();\n        while (head != null) {\n            values.add(String.valueOf(head.val));\n            head = head.next;\n        }\n        return String.join(" ", values);\n    }\n\n`;
    }

    return `import java.util.*;\n\n${classes}// User Code Starts\n// User Code Ends\n\npublic class Main{\n${helpers}    public static void main(String[] args){\n        Scanner scanner = new Scanner(System.in);\n${inputParsingCode ? inputParsingCode + '\n' : ''}        Solution solver = new Solution();\n        ${returnType === 'void' ? '' : `${returnTypeString} result = `}solver.${functionName}(${argsList});\n${outputCode}\n        scanner.close();\n    }\n}`;
}

// ------------------- JavaScript Boilerplate -------------------
function generateJavaScriptFullBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'None';

    let lineIndex: number | string = 0;
    const inputParsingCode = inputs.map((i) => {
        if (i.type.endsWith('[]')) {
            const elementType = i.type.replace('[]', '');
            const mapFunc = elementType === 'int' ? 'parseInt' : elementType === 'float' || elementType === 'double' ? 'parseFloat' : 'String';
            const code = `const ${i.name} = inputLines[${lineIndex}].trim().split(/\\s+/).map(${mapFunc});`;
            lineIndex = typeof lineIndex === 'number' ? lineIndex + 1 : `${lineIndex} + 1`;
            return code;
        }
        if (['int', 'float', 'double'].includes(i.type)) {
            const code = `const ${i.name} = ${i.type === 'int' ? 'parseInt' : 'parseFloat'}(inputLines[${lineIndex}]);`;
            lineIndex = typeof lineIndex === 'number' ? lineIndex + 1 : `${lineIndex} + 1`;
            return code;
        }
        if (i.type === 'TreeNode') {
            const code = `const ${i.name} = buildTree(inputLines[${lineIndex}]);`;
            lineIndex = typeof lineIndex === 'number' ? lineIndex + 1 : `${lineIndex} + 1`;
            return code;
        }
        if (i.type === 'ListNode') {
            const code = `const ${i.name} = buildList(inputLines[${lineIndex}]);`;
            lineIndex = typeof lineIndex === 'number' ? lineIndex + 1 : `${lineIndex} + 1`;
            return code;
        }
        if (i.type === 'AdjacencyMatrix') {
            const startLine = lineIndex;
            const code = `const size_${i.name} = parseInt(inputLines[${startLine}]);\nconst ${i.name} = [];\nfor(let i = 0; i < size_${i.name}; i++) {\n    ${i.name}.push(inputLines[${startLine} + 1 + i].trim().split(/\\s+/).map(parseInt));\n}\nlet nextLine_${i.name} = ${startLine} + 1 + size_${i.name};`;
            lineIndex = `nextLine_${i.name}`;
            return code;
        }
        if (i.type === 'AdjacencyList') {
            const startLine = lineIndex;
            const code = `const vertices_${i.name} = parseInt(inputLines[${startLine}]);\n// Convert adjacency list to matrix\nconst ${i.name} = Array(vertices_${i.name}).fill(null).map(() => Array(vertices_${i.name}).fill(0));\nfor(let i = 0; i < vertices_${i.name}; i++) {\n    const neighbors = inputLines[${startLine} + 1 + i].trim().split(/\\s+/).map(parseInt);\n    for(const neighbor of neighbors) {\n        ${i.name}[i][neighbor] = 1;\n    }\n}\nlet nextLine_${i.name} = ${startLine} + 1 + vertices_${i.name};`;
            lineIndex = `nextLine_${i.name}`;
            return code;
        }
        const code = `const ${i.name} = inputLines[${lineIndex}];`;
        lineIndex = typeof lineIndex === 'number' ? lineIndex + 1 : `${lineIndex} + 1`;
        return code;
    }).join('\n');

    const argsList = inputs.map(i => i.name).join(', ');
    const outputCode = returnType === 'None' ? '' :
        returnType.endsWith('[]') ? `console.log(result.join(' '));` :
        returnType === 'TreeNode' ? `printTree(result);` :
        returnType === 'ListNode' ? `printList(result);` :
        returnType === 'AdjacencyMatrix' || returnType === 'AdjacencyList' ? `result.forEach(row => console.log(row.join(' ')));` :
        `console.log(result);`;

    let classes = '';
    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');
    if (hasTree) {
        classes += `class TreeNode {\n    constructor(val = 0, left = null, right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\n`;
    }
    if (hasList) {
        classes += `class ListNode {\n    constructor(val = 0, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n\n`;
    }

    let helpers = '';
    if (hasTree) {
        helpers += `function buildTree(data) {\n    if (!data || data === "null") return null;\n    const tokens = data.split(',').map(t => t.trim());\n    if (tokens.length === 0 || tokens[0] === "null") return null;\n    const root = new TreeNode(parseInt(tokens[0]));\n    const queue = [root];\n    let i = 1;\n    while (queue.length > 0 && i < tokens.length) {\n        const node = queue.shift();\n        if (i < tokens.length && tokens[i] !== "null") {\n            node.left = new TreeNode(parseInt(tokens[i]));\n            queue.push(node.left);\n        }\n        i++;\n        if (i < tokens.length && tokens[i] !== "null") {\n            node.right = new TreeNode(parseInt(tokens[i]));\n            queue.push(node.right);\n        }\n        i++;\n    }\n    return root;\n}\n\n`;
        helpers += `function printTree(root) {\n    if (!root) return;\n    const queue = [root];\n    const values = [];\n    while (queue.length > 0) {\n        const node = queue.shift();\n        if (node) {\n            values.push(node.val);\n            queue.push(node.left);\n            queue.push(node.right);\n        } else {\n            values.push("null");\n        }\n    }\n    while (values.length > 0 && values[values.length - 1] === "null") {\n        values.pop();\n    }\n    console.log(values.join(' '));\n}\n\n`;
    }
    if (hasList) {
        helpers += `function buildList(data) {\n    if (!data) return null;\n    const nums = data.trim().split(/\\s+/).map(parseInt);\n    if (nums.length === 0) return null;\n    const head = new ListNode(nums[0]);\n    let tail = head;\n    for (let i = 1; i < nums.length; i++) {\n        tail.next = new ListNode(nums[i]);\n        tail = tail.next;\n    }\n    return head;\n}\n\n`;
        helpers += `function printList(head) {\n    const values = [];\n    while (head) {\n        values.push(head.val);\n        head = head.next;\n    }\n    console.log(values.join(' '));\n}\n\n`;
    }

    return `const fs = require('fs');\nconst inputLines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\n${classes}${helpers}// User Code Starts\n// User Code Ends\n\n${inputParsingCode}\nconst solution = new Solution();\n${returnType === 'None' ? '' : 'const result = '}solution.${functionName}(${argsList});\n${outputCode}`;
}

// ------------------- C Boilerplate -------------------
function generateCFullBoilerplate(problem: Problem): string {
    const { functionName, inputs, output } = problem;
    const returnType = output.length > 0 ? output[0].type : 'void';
    const cTypeMap: Record<string, string> = {
        int: 'int', float: 'float', double: 'double', string: 'char*', bool: 'bool',
        char: 'char', 'long long': 'long long', 'int[]': 'int*', 'float[]': 'float*', 'double[]': 'double*',
        'string[]': 'char**', 'bool[]': 'bool*', 'char[]': 'char*',
        TreeNode: 'struct TreeNode*', ListNode: 'struct ListNode*', AdjacencyMatrix: 'int**', AdjacencyList: 'int**'
    };
    const returnTypeString = cTypeMap[returnType] || returnType;

    const inputParsingCode = inputs.map(i => {
        const cType = cTypeMap[i.type] || i.type;
        if (cType === 'int*') {
            return `        char line_${i.name}[10000];\n        fgets(line_${i.name}, sizeof(line_${i.name}), stdin);\n        int ${i.name}_size = 0;\n        int* ${i.name} = (int*)malloc(1000 * sizeof(int));\n        char* token = strtok(line_${i.name}, " \\t\\n");\n        while (token != NULL) {\n            ${i.name}[${i.name}_size++] = atoi(token);\n            token = strtok(NULL, " \\t\\n");\n        }`;
        }
        else if (cType === 'float*') {
            return `        char line_${i.name}[10000];\n        fgets(line_${i.name}, sizeof(line_${i.name}), stdin);\n        int ${i.name}_size = 0;\n        float* ${i.name} = (float*)malloc(1000 * sizeof(float));\n        char* token = strtok(line_${i.name}, " \\t\\n");\n        while (token != NULL) {\n            ${i.name}[${i.name}_size++] = atof(token);\n            token = strtok(NULL, " \\t\\n");\n        }`;
        }
        else if (cType === 'double*') {
            return `        char line_${i.name}[10000];\n        fgets(line_${i.name}, sizeof(line_${i.name}), stdin);\n        int ${i.name}_size = 0;\n        double* ${i.name} = (double*)malloc(1000 * sizeof(double));\n        char* token = strtok(line_${i.name}, " \\t\\n");\n        while (token != NULL) {\n            ${i.name}[${i.name}_size++] = atof(token);\n            token = strtok(NULL, " \\t\\n");\n        }`;
        }
        else if (cType === 'char*') return `        char ${i.name}[1000];\n        scanf("%s", ${i.name});`;
        else if (cType === 'struct TreeNode*') return `        char ${i.name}_str[10000];\n        scanf("%s", ${i.name}_str);\n        struct TreeNode* ${i.name} = buildTree(${i.name}_str);`;
        else if (cType === 'struct ListNode*') return `        char ${i.name}_str[10000];\n        scanf("%s", ${i.name}_str);\n        struct ListNode* ${i.name} = buildList(${i.name}_str);`;
        else if (i.type === 'AdjacencyMatrix') return `        int ${i.name}_size;\n        scanf("%d", &${i.name}_size);\n        int** ${i.name} = (int**)malloc(${i.name}_size * sizeof(int*));\n        for(int i=0; i<${i.name}_size; i++) {\n            ${i.name}[i] = (int*)malloc(${i.name}_size * sizeof(int));\n            for(int j=0; j<${i.name}_size; j++) scanf("%d", &${i.name}[i][j]);\n        }`;
        else if (i.type === 'AdjacencyList') return `        int ${i.name}_vertices;\n        scanf("%d", &${i.name}_vertices);\n        // Create adjacency matrix (n x n)\n        int** ${i.name} = (int**)malloc(${i.name}_vertices * sizeof(int*));\n        for(int i=0; i<${i.name}_vertices; i++) {\n            ${i.name}[i] = (int*)calloc(${i.name}_vertices, sizeof(int));\n        }\n        // Read adjacency list and convert to matrix\n        for(int i=0; i<${i.name}_vertices; i++) {\n            char line[1000];\n            scanf(" ");\n            fgets(line, sizeof(line), stdin);\n            char* token = strtok(line, " \\t\\n");\n            while (token != NULL) {\n                int neighbor = atoi(token);\n                ${i.name}[i][neighbor] = 1;\n                token = strtok(NULL, " \\t\\n");\n            }\n        }`;
        else return `        ${cType} ${i.name};\n        scanf("${cType === 'int' ? '%d' : cType === 'float' ? '%f' : cType === 'double' ? '%lf' : cType === 'char' ? '%c' : '%lld'}", &${i.name});`;
    }).join('\n');

    // For array return types in C, we need a returnSize parameter
    const needsReturnSize = returnType.endsWith('[]');
    
    // Build arguments list, including size variables for graphs/arrays
    const buildArgsList = (includeReturnSize: boolean) => {
        const args = inputs.map(i => {
            if (i.type === 'AdjacencyMatrix') return `${i.name}, ${i.name}_size`;
            if (i.type === 'AdjacencyList') return `${i.name}, ${i.name}_vertices`;
            if (i.type.endsWith('[]') && cTypeMap[i.type]?.includes('*')) return `${i.name}, ${i.name}_size`;
            return i.name;
        });
        if (includeReturnSize) args.push('&returnSize');
        return args.join(', ');
    };
    
    const argsList = buildArgsList(needsReturnSize);
    const argsListNoReturnSize = buildArgsList(false);
    
    const functionCall = returnType === 'void' ? 
        `    ${functionName}(${argsListNoReturnSize});` :
        needsReturnSize ?
        `    int returnSize = 0;\n    ${returnTypeString} result = ${functionName}(${argsList});` :
        `    ${returnTypeString} result = ${functionName}(${argsListNoReturnSize});`;
    
    const outputCode = returnType === 'void' ? '' :
        returnType === 'TreeNode' ? `    printTree(result);` :
        returnType === 'ListNode' ? `    printList(result);` :
        returnType === 'AdjacencyMatrix' ? `    for(int i=0; i<size; i++) {\n        for(int j=0; j<size; j++) printf("%d ", result[i][j]);\n        printf("\\n");\n    }` :
        returnType === 'AdjacencyList' ? `    for(int i=0; i<vertices; i++) {\n        for(int j=0; j<neighbors_size; j++) printf("%d ", result[i][j]);\n        printf("\\n");\n    }` :
        returnType.endsWith('[]') ? `    for(int i=0; i<returnSize; i++) {\n        if(i>0) printf(" ");\n        printf("%d", result[i]);\n    }\n    printf("\\n");` :
        `    printf("${returnType === 'int' ? '%d' : returnType === 'float' ? '%f' : returnType === 'double' ? '%lf' : returnType === 'char' ? '%c' : '%lld'}\\n", result);`;

    let structs = '';
    const hasTree = inputs.some(i => i.type === 'TreeNode') || output.some(o => o.type === 'TreeNode');
    const hasList = inputs.some(i => i.type === 'ListNode') || output.some(o => o.type === 'ListNode');
    if (hasTree) {
        structs += `struct TreeNode {\n    int val;\n    struct TreeNode *left;\n    struct TreeNode *right;\n};\n\n`;
    }
    if (hasList) {
        structs += `struct ListNode {\n    int val;\n    struct ListNode *next;\n};\n\n`;
    }

    let helpers = '';
    if (hasTree) {
        helpers += `struct TreeNode* buildTree(char* data) {\n    if (!data || strcmp(data, "null") == 0) return NULL;\n    char* token = strtok(data, ",");\n    if (!token) return NULL;\n    struct TreeNode* root = (struct TreeNode*)malloc(sizeof(struct TreeNode));\n    root->val = atoi(token);\n    root->left = root->right = NULL;\n    struct TreeNode** queue = (struct TreeNode**)malloc(10000 * sizeof(struct TreeNode*));\n    int front = 0, rear = 0;\n    queue[rear++] = root;\n    while (front < rear) {\n        struct TreeNode* node = queue[front++];\n        token = strtok(NULL, ",");\n        if (token && strcmp(token, "null") != 0) {\n            node->left = (struct TreeNode*)malloc(sizeof(struct TreeNode));\n            node->left->val = atoi(token);\n            node->left->left = node->left->right = NULL;\n            queue[rear++] = node->left;\n        }\n        token = strtok(NULL, ",");\n        if (token && strcmp(token, "null") != 0) {\n            node->right = (struct TreeNode*)malloc(sizeof(struct TreeNode));\n            node->right->val = atoi(token);\n            node->right->left = node->right->right = NULL;\n            queue[rear++] = node->right;\n        }\n    }\n    free(queue);\n    return root;\n}\n\n`;
        helpers += `void printTree(struct TreeNode* root) {\n    if (!root) return;\n    struct TreeNode** queue = (struct TreeNode**)malloc(10000 * sizeof(struct TreeNode*));\n    int front = 0, rear = 0;\n    queue[rear++] = root;\n    int* values = (int*)malloc(10000 * sizeof(int));\n    int valueCount = 0;\n    while (front < rear) {\n        struct TreeNode* node = queue[front++];\n        if (node) {\n            values[valueCount++] = node->val;\n            queue[rear++] = node->left;\n            queue[rear++] = node->right;\n        } else {\n            values[valueCount++] = -1; // sentinel for null\n        }\n    }\n    while (valueCount > 0 && values[valueCount-1] == -1) valueCount--;\n    for (int i = 0; i < valueCount; i++) {\n        if (i > 0) printf(" ");\n        if (values[i] == -1) printf("null");\n        else printf("%d", values[i]);\n    }\n    printf("\\n");\n    free(queue);\n    free(values);\n}\n\n`;
    }
    if (hasList) {
        helpers += `struct ListNode* buildList(char* data) {\n    if (!data) return NULL;\n    char* token = strtok(data, " ");\n    if (!token) return NULL;\n    struct ListNode* head = (struct ListNode*)malloc(sizeof(struct ListNode));\n    head->val = atoi(token);\n    head->next = NULL;\n    struct ListNode* tail = head;\n    while ((token = strtok(NULL, " ")) != NULL) {\n        tail->next = (struct ListNode*)malloc(sizeof(struct ListNode));\n        tail->next->val = atoi(token);\n        tail->next->next = NULL;\n        tail = tail->next;\n    }\n    return head;\n}\n\n`;
        helpers += `void printList(struct ListNode* head) {\n    while (head) {\n        printf("%d", head->val);\n        if (head->next) printf(" ");\n        head = head->next;\n    }\n    printf("\\n");\n}\n\n`;
    }

    return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

${structs}${helpers}// User Code Starts

// User Code Ends

int main() {
${inputParsingCode ? inputParsingCode + '\n' : ''}
${functionCall}
${outputCode}
    return 0;
}`;
}

// ------------------- Main Generator -------------------
function generateBoilerplateFullFiles(problem: Problem, outputDir: string) {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'solution.cpp'), generateCppFullBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'solution.py'), generatePythonFullBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'Solution.java'), generateJavaFullBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'solution.js'), generateJavaScriptFullBoilerplate(problem));
    fs.writeFileSync(path.join(outputDir, 'solution.c'), generateCFullBoilerplate(problem));

    console.log(`✅ Generated Judge0-compatible boilerplate files for: ${problem.problemName}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('📄 Generated files: solution.cpp, solution.py, Solution.java, solution.js, solution.c');
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
