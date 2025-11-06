from typing import List
# User Code Starts

# User Code Ends

if __name__ == "__main__":
    arr = list(map(int, input().strip().split()))
    target = int(input())
    solver = Solution()
    result = solver.twoSum(arr, target)
    print(result)
