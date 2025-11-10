from typing import List
# User Code Starts
# User Code Ends

if __name__ == "__main__":
    list1 = list(map(int, input().strip().split()))
    list2 = list(map(int, input().strip().split()))
    solver = Solution()
    result = solver.mergeSortedLists(list1, list2)
    print(' '.join(map(str, result)))
