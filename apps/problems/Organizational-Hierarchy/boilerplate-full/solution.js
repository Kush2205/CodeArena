const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function buildTree(data) {
    if (!data || data === "null") return null;
    const tokens = data.split(' ').map(t => t.trim());
    if (tokens.length === 0 || tokens[0] === "null") return null;
    const root = new TreeNode(parseInt(tokens[0]));
    const queue = [root];
    let i = 1;
    while (queue.length > 0 && i < tokens.length) {
        const node = queue.shift();
        if (i < tokens.length && tokens[i] !== "null") {
            node.left = new TreeNode(parseInt(tokens[i]));
            queue.push(node.left);
        }
        i++;
        if (i < tokens.length && tokens[i] !== "null") {
            node.right = new TreeNode(parseInt(tokens[i]));
            queue.push(node.right);
        }
        i++;
    }
    return root;
}

function printTree(root) {
    if (!root) return;
    const queue = [root];
    const values = [];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node) {
            values.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
        } else {
            values.push("null");
        }
    }
    while (values.length > 0 && values[values.length - 1] === "null") {
        values.pop();
    }
    console.log(values.join(' '));
}

// User Code Starts
// User Code Ends

const root = buildTree(inputLines[0]);
const solution = new Solution();
const result = solution.levelOrderTraversal(root);
result.forEach(row => console.log(row.join(' ')));