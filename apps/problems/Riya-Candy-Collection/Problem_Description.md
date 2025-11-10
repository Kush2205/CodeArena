# 🍬 Problem: Riya's Candy Collection

Riya loves collecting candies of different colors.

She has a list of her favorite candy colors, represented by the string `favorites`, and a big jar full of candies she currently owns, represented by the string `candies`.

Each character in both strings represents a candy color (for example, `'a'` or `'B'`).

**Your task** is to find out how many candies in her jar are of her favorite colors.

**Note** that the colors are case-sensitive — `'a'` and `'A'` represent different colors.

Return the number of favorite candies Riya currently has.

---

## 🍭 Example 1
**Input:**
```
favorites = "aA"
candies = "aAAbbbb"
```
**Output:**
```
3
```
**Explanation:**
Riya's favorite colors are 'a' and 'A'.
In her candy jar, she has: `a A A b b b b`
→ 3 candies (a, A, A) match her favorites.

---

## 🍭 Example 2
**Input:**
```
favorites = "z"
candies = "ZZ"
```
**Output:**
```
0
```
**Explanation:**
Riya's favorite color is 'z', but all candies in her jar are 'Z'.
Since color matching is case-sensitive, she has 0 favorite candies.

---

## 🍬 Constraints
- `1 ≤ favorites.length, candies.length ≤ 50`
- Both strings consist only of English letters
- All characters in `favorites` are unique

---

## 💡 Hints
- Use a HashSet to store favorite candy colors
- Iterate through the candies and check membership
- Time complexity: O(n + m) where n = favorites.length, m = candies.length
