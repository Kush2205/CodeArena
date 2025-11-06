# Count Duplicates

## Problem Statement

Given an array of integers `arr`, return the number of elements that appear more than once in the array.



## Constraints

- 1 ≤ n ≤ 200,000
- 1 ≤ arr[i] ≤ 10⁹
- Time Limit: 2 seconds per test case

## Example

### Input 1
```
arr = [1 2 3 2 4 3 5]
```

### Output 1
```
2
```

**Explanation**: Numbers 2 and 3 appear more than once.

### Input 2
```
arr = [1 1 1 1 1]
```

### Output 2
```
1
```

**Explanation**: Only number 1 appears, and it appears more than once.

### Input 3
```
arr = [1 2 3 4 5 6]
```

### Output 3
```
0
```

**Explanation**: No number appears more than once.

## Notes

- O(n²) solution comparing each element with every other will get TLE on large test cases
- Use a HashMap/Set for O(n) solution
- Each duplicate number should be counted only once
