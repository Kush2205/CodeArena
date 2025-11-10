from typing import List
# User Code Starts
# User Code Ends

if __name__ == "__main__":
    k = int(input())
    n = int(input())
    solver = Solution()
    result = solver.findGiftCombinations(k, n)
    print(' '.join(map(str, result)))
