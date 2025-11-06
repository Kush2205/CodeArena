from typing import List
# User Code Starts

# User Code Ends

if __name__ == "__main__":
    arr = list(map(int, input().strip().split()))
    target = float(input())
    solver = Solution()
    result = solver.subArraySum(arr, target)
    print(result)
