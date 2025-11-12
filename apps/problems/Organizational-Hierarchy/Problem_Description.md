# 🏢 Problem: Riya's Organizational Hierarchy

Riya is designing an organizational hierarchy system for her company.

Each employee in the company may have up to two direct subordinates — one on the left and one on the right.

The hierarchy starts with the CEO at the top (the root of the hierarchy).

Riya wants to record how the employees are arranged **level by level**, starting from the CEO and moving downwards — listing employees from left to right at each level.

Given the root of this hierarchy (represented as a binary tree), return a list of lists, where each inner list contains the employee IDs (or values) at that level.

**Note:** In the input representation, `null` indicates that an employee does not have a subordinate at that position.

---

## 💼 Example 1
**Input:**
```
root = [3, 9, 20, null, null, 15, 7]
```
**Output:**
```
[[3], [9, 20], [15, 7]]
```

**Explanation:**
The company hierarchy looks like this:
```
       3  (CEO)
      / \
     9   20
         / \
        15  7
```
- Level 1 → [3]
- Level 2 → [9, 20]
- Level 3 → [15, 7]

---

## 💼 Example 2
**Input:**
```
root = [1]
```
**Output:**
```
[[1]]
```
**Explanation:**
There's only one employee (the CEO).

---

## 💼 Example 3
**Input:**
```
root = []
```
**Output:**
```
[]
```
**Explanation:**
No employees exist in the organization.

---

## 🏢 Constraints
- The number of employees (nodes) in the hierarchy is in the range `[0, 2000]`
- `-1000 ≤ Node.val ≤ 1000`

---

## 💡 Hints
- Use BFS (Breadth-First Search) with a queue
- Process nodes level by level
- Keep track of the number of nodes at each level
