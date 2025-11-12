# 📦 Problem: Merging Riya's Delivery Lists

Riya works for a delivery company that keeps records of all parcel delivery IDs in sorted order.

One day, she receives two delivery lists:
- `list1`, containing delivery IDs (sorted in non-decreasing order)
- `list2`, containing delivery IDs (also sorted in non-decreasing order)

Riya needs to combine both lists into a single sorted list of delivery IDs.

**Return** the new merged list, containing all elements from both lists in sorted (non-decreasing) order.

---

## 📋 Input Format
- `list1`: integer array (sorted in non-decreasing order)
- `list2`: integer array (sorted in non-decreasing order)

## 🎯 Output
Return a new array containing all delivery IDs from both lists in sorted order.

---

## 🚚 Example 1
**Input:**
```
list1 = [1, 2, 3]
list2 = [2, 5, 6]
```
**Output:**
```
[1, 2, 2, 3, 5, 6]
```
**Explanation:**
Merging the two sorted delivery lists [1, 2, 3] and [2, 5, 6] results in [1, 2, 2, 3, 5, 6].

---

## 🚚 Example 2
**Input:**
```
list1 = [1]
list2 = []
```
**Output:**
```
[1]
```
**Explanation:**
Since the second list is empty, the merged result remains [1].

---

## 🚚 Example 3
**Input:**
```
list1 = []
list2 = [1]
```
**Output:**
```
[1]
```
**Explanation:**
The first list is empty, so the merged list is simply [1].

---

## 📦 Constraints
- `0 ≤ list1.length, list2.length ≤ 200`
- `1 ≤ list1.length + list2.length ≤ 200`
- `-10⁹ ≤ list1[i], list2[j] ≤ 10⁹`
- Both `list1` and `list2` are sorted in non-decreasing order

---

## 💡 Hints
- Think about the two-pointer approach for merging sorted arrays
- You can achieve O(m + n) time complexity with O(m + n) space
- Compare elements from both arrays and pick the smaller one
