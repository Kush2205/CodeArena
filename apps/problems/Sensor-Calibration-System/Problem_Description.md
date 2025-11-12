# ⚡ Problem: Riya's Sensor Calibration System

Riya supervises a factory conveyor belt equipped with a series of sensors that record integer readings over time.

The readings are stored in an array `nums`, where each reading is an integer in the range `[0, 2¹⁰)`.

For proper synchronization, every group of **k consecutive readings** (called a segment) must be **balanced** — meaning the bitwise XOR of all readings in that segment should be equal to **0**.

Unfortunately, some sensors are miscalibrated, and their readings violate this rule.

Riya can **recalibrate sensors** — that is, she can change any reading to any integer in the same range `[0, 2¹⁰)`. Each recalibration counts as one change.

Your task is to determine the **minimum number of sensor readings** that must be changed so that every contiguous segment of length **k** has an XOR value of **0**.

---

## ⚡ Example 1
**Input:**
```
nums = [1, 2, 0, 3, 0], k = 1
```
**Output:**
```
3
```
**Explanation:**
Each segment has size 1, so each reading itself must be 0.
We must change 3 nonzero readings → [0, 0, 0, 0, 0].

---

## ⚡ Example 2
**Input:**
```
nums = [3, 4, 5, 2, 1, 7, 3, 4, 7], k = 3
```
**Output:**
```
3
```
**Explanation:**
Each window of 3 consecutive readings should XOR to 0.
One valid calibration result is [3, 4, 7, 3, 4, 7, 3, 4, 7].
Here, every 3-length segment — like [3, 4, 7], [4, 7, 3], etc. — has XOR = 0.
Only 3 readings needed to be changed.

---

## ⚡ Example 3
**Input:**
```
nums = [1, 2, 4, 1, 2, 5, 1, 2, 6], k = 3
```
**Output:**
```
3
```
**Explanation:**
One valid recalibration is [1, 2, 3, 1, 2, 3, 1, 2, 3].
Now every consecutive 3 readings XOR to 0.

---

## 🧮 How It Works
For each position on the conveyor, its index `i` determines which segments it affects.
- Readings with the same remainder `i % k` belong to the same sensor cycle
- The goal is to adjust readings in these cycles so that when combined across cycles, the XOR of each k-length block becomes 0
- This structure lets you group readings by their cycle index and compute the optimal minimal number of recalibrations

---

## 🧾 Constraints
- `1 ≤ k ≤ nums.length ≤ 2000`
- `0 ≤ nums[i] < 2¹⁰`

---

## 💡 Hints
- Group elements by position `i % k`
- For each group, find the most frequent value
- The XOR constraint links values across different groups
- Use dynamic programming or frequency counting
