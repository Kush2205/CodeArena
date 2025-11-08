## Problem: Graph BFS Traversal (Medium)

Given an adjacency list representation of a graph and a starting vertex, return the BFS traversal order of the graph starting from the given vertex.

Breadth-First Search (BFS) explores all vertices at the present depth level before moving on to vertices at the next depth level.

### Examples

#### Example 1:
```
Input: graph = [[1,2],[0,3],[0,3],[1,2]], start = 0
Output: [0,1,2,3]
```
**Explanation:**
```
    0
   / \
  1   2
   \ /
    3
```
BFS starting from 0: 0 → 1,2 → 3

#### Example 2:
```
Input: graph = [[1],[0,2],[1]], start = 1
Output: [1,0,2]
```

#### Example 3:
```
Input: graph = [[1,2],[2],[0,1]], start = 0
Output: [0,1,2]
```

### Constraints

- Number of vertices V is in the range [1, 100]
- Graph may contain disconnected components
- Graph may contain self-loops and parallel edges
- All vertex indices are valid (0 to V-1)