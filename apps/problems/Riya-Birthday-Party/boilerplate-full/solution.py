from typing import List
# User Code Starts
# User Code Ends

if __name__ == "__main__":
    favorite = list(map(int, input().strip().split()))
    solver = Solution()
    result = solver.maximumInvitations(favorite)
    print(result)
