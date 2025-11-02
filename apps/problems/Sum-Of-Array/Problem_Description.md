## Problem: Sum of Array (Easy)

Given an integer array, return the sum of all elements in the array.

This problem tests basic array traversal and accumulation.

### Examples

#### Example 1:
```
Input: arr = [1,2,3,4,5]
```

```
Output: 15
```
##### Explanation: 1 + 2 + 3 + 4 + 5 = 15.

#### Example 2:
```
Input: arr = [-3,5,2]
```

```
Output: 4
```
##### Explanation: -3 + 5 + 2 = 4.

#### Example 3:
```
Input: arr = [100]
```
```
Output: 100
```
### Constraints
- 1 ≤ arr.length ≤ 1000
- −1,000,000 ≤ arr[i] ≤ 1,000,000
- The sum fits in a 32-bit signed integer

### Notes
- Handle negative values.
- Handle single element arrays.
- Expected time/space: O(n) / O(1).
