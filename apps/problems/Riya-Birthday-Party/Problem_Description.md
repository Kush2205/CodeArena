# 🎉 Problem: Riya's Birthday Party Guests

Riya is hosting her birthday party and has **n** friends she might invite.

She's arranged a large circular table, big enough to seat any number of friends.

Each friend has **one favorite person** — someone they absolutely want to sit beside. If they can't sit next to their favorite person, they'll refuse to attend the party!

Riya knows everyone's preference and wants to invite the largest possible group of friends who can all be seated around the table in such a way that **everyone's favorite person is sitting beside them**.

You are given a **0-indexed integer array** `favorite`, where `favorite[i]` represents the favorite person of the i-th friend. Each friend's favorite person is not themselves.

Return the **maximum number of friends** Riya can invite to her party.

---

## 🎂 Example 1
**Input:**
```
favorite = [2, 2, 1, 2]
```
**Output:**
```
3
```
**Explanation:**
Riya can invite friends 0, 1, and 2, and seat them around the table as [1, 2, 0].
- Friend 1 sits next to 2 (their favorite)
- Friend 2 sits next to 1 (their favorite)
- Friend 0 sits next to 2 (their favorite)

All conditions are satisfied. Riya can also invite [1, 2, 3], which works equally well. Hence, the maximum number of friends that can attend is **3**.

---

## 🎂 Example 2
**Input:**
```
favorite = [1, 2, 0]
```
**Output:**
```
3
```
**Explanation:**
Here, each friend's favorite is part of a loop:
- 0 → 1, 1 → 2, 2 → 0

All three can sit around the table as [0, 1, 2], making everyone happy. So, Riya can invite all **3 friends**.

---

## 🎂 Example 3
**Input:**
```
favorite = [3, 0, 1, 4, 1]
```
**Output:**
```
4
```
**Explanation:**
Riya can invite friends [0, 1, 3, 4] and seat them so that everyone sits beside their favorite. Friend 2, however, cannot be included because both seats next to their favorite (friend 1) are already taken. Thus, the maximum number of guests is **4**.

---

## 🎈 Constraints
- `n == favorite.length`
- `2 ≤ n ≤ 10⁵`
- `0 ≤ favorite[i] ≤ n − 1`
- `favorite[i] != i`

---

## 💡 Hints
- Think about graph cycles
- Find all cycles in the directed graph
- Consider cycles of length 2 specially (mutual favorites)
- For cycles of length > 2, you can only use the cycle itself
- For cycles of length 2, you can extend with chains
