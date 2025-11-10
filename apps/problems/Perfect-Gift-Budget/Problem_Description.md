# 💰 Problem: Perfect Gift Budget

Riya wants to buy **k** different gifts for her friends.

Each gift has a unique price between **₹1** and **₹9**.

She has a total budget of **₹n**, and she wants to spend exactly that amount.

Your task is to help Riya find **all possible sets** of **k** gifts whose prices add up to exactly **n**.

Each price can be used only once, and combinations with the same prices in a different order are considered the same (so return only unique sets).

Return the list of all possible combinations in any order.

---

## 🧮 Example 1
**Input:**
```
k = 3, n = 7
```
**Output:**
```
[[1, 2, 4]]
```
**Explanation:**
Buying gifts priced ₹1, ₹2, and ₹4 will exactly use up the ₹7 budget. No other combination works.

---

## 🧮 Example 2
**Input:**
```
k = 3, n = 9
```
**Output:**
```
[[1, 2, 6], [1, 3, 5], [2, 3, 4]]
```
**Explanation:**
These are all possible sets of 3 gifts that total ₹9.

---

## 🧮 Example 3
**Input:**
```
k = 4, n = 1
```
**Output:**
```
[]
```
**Explanation:**
Even the cheapest four gifts (₹1, ₹2, ₹3, ₹4) cost ₹10 in total, which exceeds ₹1. Hence, there's no valid combination.

---

## 📋 Constraints
- `2 ≤ k ≤ 9`
- `1 ≤ n ≤ 60`

---

## 💡 Hints
- Use backtracking to explore all combinations
- Prune early if the current sum exceeds n
- Only use numbers 1-9, each at most once
