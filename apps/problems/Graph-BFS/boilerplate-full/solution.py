from typing import List
# User Code Starts
# User Code Ends

if __name__ == "__main__":
    vertices = int(input())
    graph = [list(map(int, input().split())) for _ in range(vertices)]
    start = int(input())
    solver = Solution()
    result = solver.graphBFSTraversal(graph, start)
    print(' '.join(map(str, result)))
