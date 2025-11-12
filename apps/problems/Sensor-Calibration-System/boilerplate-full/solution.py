from typing import List
# User Code Starts
# User Code Ends

if __name__ == "__main__":
    nums = list(map(int, input().strip().split()))
    k = int(input())
    solver = Solution()
    result = solver.minChanges(nums, k)
    print(result)
