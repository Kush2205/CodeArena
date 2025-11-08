from typing import List
# User Code Starts
# User Code Ends

if __name__ == "__main__":
    arr = list(map(int, input().strip().split()))
    solver = Solution()
    result = solver.countEvenNumbers(arr)
    print(result)
