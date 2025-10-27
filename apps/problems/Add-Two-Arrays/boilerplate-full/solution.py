from typing import List
# User Code Starts

# User Code Ends

if __name__ == "__main__":
    a = list(map(int, input().strip().split()))
    b = list(map(int, input().strip().split()))
    solver = Solution()
    result = solver.addTwoArrays(a, b)
    print(' '.join(map(str, result)))
