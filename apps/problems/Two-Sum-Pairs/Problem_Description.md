# Two Sum Pairs

## Problem Statement

Given an array of integers `arr` and a target sum `target`, return the number of pairs of indices `(i, j)` where `i < j` such that `arr[i] + arr[j] = target`.



## Constraints

- 1 ≤ n ≤ 200,000
- -10⁹ ≤ arr[i] ≤ 10⁹
- -10⁹ ≤ target ≤ 10⁹
- Time Limit: 2 seconds per test case

## Example

### Input 1
```
array = [1 2 3 4 5]
target = 6
```

### Output 1
```
2
```

**Explanation**: Pairs (1,5) and (2,4) sum to 6.

### Input 2
```
array = [1 1 1 1 1 1]
target = 2
```

### Output 2
```
15
```

**Explanation**: Any two 1's sum to 2, and there are C(6,2) = 15 such pairs.

## Notes

- O(n²) solution will get TLE on large test cases
- Use a HashMap/Dictionary for O(n) solution
- Be careful with duplicate elements
