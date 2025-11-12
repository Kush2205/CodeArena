const fs = require('fs');
const inputLines = fs.readFileSync(0, 'utf-8').trim().split('\n');

// User Code Starts
// User Code Ends

const vertices_graph = parseInt(inputLines[0]);
// Convert adjacency list to matrix
const graph = Array(vertices_graph).fill(null).map(() => Array(vertices_graph).fill(0));
for(let i = 0; i < vertices_graph; i++) {
    const neighbors = inputLines[0 + 1 + i].trim().split(/\s+/).map(parseInt);
    for(const neighbor of neighbors) {
        graph[i][neighbor] = 1;
    }
}
let nextLine_graph = 0 + 1 + vertices_graph;
const start = parseInt(inputLines[nextLine_graph]);
const solution = new Solution();
const result = solution.graphBFSTraversal(graph, start);
console.log(result.join(' '));