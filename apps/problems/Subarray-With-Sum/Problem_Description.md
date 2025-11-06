# Subarray with Target Sum

## Problem Statement

Given an array of positive integers `arr` and a target sum `target`, find if there exists a contiguous subarray with sum equal to the target. Return `1` if such a subarray exists, otherwise return `0`.


## Constraints

- 1 ≤ n ≤ 200,000
- 1 ≤ arr[i] ≤ 10⁶
- 1 ≤ target ≤ 10⁹
- Time Limit: 2 seconds per test case

## Example

### Input 1
```
arr = [1 2 3 4 5]
target = 9
```

### Output 1
```
1
```

**Explanation**: Subarray [2, 3, 4] has sum = 9.

### Input 2
```
array = [1 2 3 4]
target = 11
```

### Output 2
```
0
```

**Explanation**: No subarray has sum = 11.

### Input 3
```
array = [5 10 15 20 25 30]
target = 65
```

### Output 3
```
1
```

**Explanation**: Subarray [15, 20, 30] = 65.

## Notes

- Brute force O(n²) checking all subarrays will get TLE on large test cases
- Use sliding window or prefix sum with HashMap for O(n) solution
- All array elements are positive integers
