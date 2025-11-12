# Question Contribution Guide

This guide outlines the process and rules for contributing questions to the CodeArena LeetCode clone project.

## 📁 Project Structure

Questions are organized in the `apps/problems/` directory. Each problem must follow this exact structure:

```
apps/problems/Problem-Name/
├── Problem_Description.md
├── Structure.md
├── boilerplate-editor/
│   ├── solution.c
│   ├── solution.cpp
│   ├── solution.py
│   ├── Solution.java
│   └── solution.js
├── boilerplate-full/
│   ├── solution.c
│   ├── solution.cpp
│   ├── solution.py
│   ├── Solution.java
│   └── solution.js
└── test_cases/
    ├── 0.in.txt
    ├── 0.out.txt
    ├── 1.in.txt
    ├── 1.out.txt
    └── ...
```

## 📝 File Format Specifications

### 1. Problem_Description.md

**Format Requirements:**
- Use Markdown format
- Include problem title with difficulty level: `## Problem: Title (Difficulty)`
- Provide clear problem description
- Include multiple examples with proper formatting
- Use code blocks for input/output examples

**Example:**
```markdown
## Problem: Sum of Array (Easy)

Given an integer array, return the sum of all elements in the array.

This problem tests basic array traversal and accumulation.

### Examples

#### Example 1:
```
Input: arr = [1,2,3,4,5]
Output: 15
```
**Explanation:** 1 + 2 + 3 + 4 + 5 = 15.

#### Example 2:
```
Input: arr = [10,20,30]
Output: 60
```
```

### 2. Structure.md

**Format Requirements:**
- Use exact format with proper spacing
- Define problem name, function name, input and output structures
- Use supported data types only

**Supported Data Types:**
- Primitive: `int`, `float`, `double`, `string`, `bool`, `char`, `long long`
- Arrays: `int[]`, `float[]`, `double[]`, `string[]`, `bool[]`, `char[]`
- Complex: `TreeNode`, `ListNode`, `AdjacencyMatrix`, `AdjacencyList`

**Example:**
```markdown
Problem Name : sum of array

Function Name : sumOfArray

Input Structure:
Input Field: int[] arr

Output Structure:
Output Field: int result
```

### Multiple Input Fields

For problems requiring multiple inputs, list each input field on a separate line:

**Example with Multiple Inputs:**
```markdown
Problem Name : two sum

Function Name : twoSum

Input Structure:
Input Field: int[] nums
Input Field: int target

Output Structure:
Output Field: int[] result
```

**Example with Mixed Data Types:**
```markdown
Problem Name : binary tree level order traversal

Function Name : levelOrder

Input Structure:
Input Field: TreeNode root

Output Structure:
Output Field: int[][] result
```

**Example with Complex Graph Input:**
```markdown
Problem Name : graph shortest path

Function Name : shortestPath

Input Structure:
Input Field: AdjacencyList graph
Input Field: int start
Input Field: int end

Output Structure:
Output Field: int result
```

**Example with Linked List and Value:**
```markdown
Problem Name : add two numbers

Function Name : addTwoNumbers

Input Structure:
Input Field: ListNode l1
Input Field: ListNode l2

Output Structure:
Output Field: ListNode result
```

### Structure.md Format Rules

1. **Problem Name**: Use lowercase with spaces
2. **Function Name**: Use camelCase
3. **Input Structure**: Each input field on separate line with format `Input Field: <type> <name>`
4. **Output Structure**: Single output field with format `Output Field: <type> <name>`
5. **Spacing**: Maintain exact spacing and line breaks as shown
6. **Data Types**: Use only supported data types listed above

### Input Order in Test Cases

When creating test case input files, provide inputs in the same order as defined in Structure.md:

**For `twoSum` example above:**
```
# 0.in.txt
1 2 3 4 5
9

# 0.out.txt  
0 4
```

**For `graph shortest path` example:**
```
# 0.in.txt (AdjacencyList + start + end)
4
1 2
0 3
0 3
1 2
0
3

# 0.out.txt
2
```

**Format Requirements:**
- Input files: `N.in.txt` (where N starts from 0)
- Output files: `N.out.txt` (corresponding to input)
- At least 5-10 test cases per problem
- Cover edge cases, normal cases, and boundary conditions

**Input Format Rules:**
- Arrays: Space-separated values (e.g., `1 2 3 4 5`)
- Strings: Single line strings
- TreeNode: Level-order traversal, comma-separated, use "null" for empty nodes (e.g., `1,2,3,null,4`)
- ListNode: Comma-separated values (e.g., `1,2,3,4,5`)
- AdjacencyMatrix: First line is size N, followed by N lines of N space-separated integers
- AdjacencyList: First line is number of vertices V, followed by V lines of space-separated neighbor lists

**Output Format Rules:**
- Single values: Direct output
- Arrays: Space-separated values
- Complex structures: Serialized format matching input conventions

## 🏷️ Naming Conventions

### Problem Directory Name
- Use `PascalCase` with hyphens for multi-word names
- Examples: `Sum-Of-Array`, `Two-Sum-Pairs`, `Binary-Tree-Inorder-Traversal`

### Function Name
- Use `camelCase`
- Be descriptive and follow common naming patterns
- Examples: `sumOfArray`, `twoSum`, `inorderTraversal`

### Problem Name
- Use lowercase with spaces
- Should match the directory name but in readable format
- Examples: "sum of array", "two sum pairs"

## 🔧 Boilerplate Generation

**Do not manually create boilerplate files!** They are auto-generated using:

```bash
# Generate editor boilerplates
bun run gen-bp Problem-Name

# Generate full Judge0-compatible boilerplates
bun run gen-bp-full Problem-Name
```

The generation scripts will create:
- Function signatures in all supported languages
- Proper imports and includes
- Type definitions for complex data structures
- Input parsing logic (for full boilerplates)
- Output formatting logic (for full boilerplates)

## ✅ Validation Rules

### Required Checks Before Submission

1. **Structure Validation:**
   - All required files present
   - Directory name matches problem name format
   - File names follow exact conventions

2. **Content Validation:**
   - Problem description is clear and unambiguous
   - Examples are correct and comprehensive
   - Structure.md uses only supported data types
   - Function name is valid camelCase

3. **Test Case Validation:**
   - At least 5 test cases
   - Input/output pairs are correct
   - Edge cases covered (empty arrays, single elements, large inputs)
   - Input format matches expected parsing logic

4. **Boilerplate Validation:**
   - All language files generated successfully
   - No syntax errors in generated code
   - Complex data structures properly defined

## 🚀 Contribution Process

### Step 1: Prepare the Problem
1. Create a new directory under `apps/problems/` with proper naming
2. Write `Problem_Description.md` following the format
3. Create `Structure.md` with correct structure definition
4. Create comprehensive test cases in `test_cases/` directory

### Step 2: Generate Boilerplates
```bash
# Navigate to utils directory
cd apps/utils

# Generate boilerplates
bun run generateBoilerplate.ts Your-Problem-Name
bun run generateBoilerPlateFull.ts Your-Problem-Name
```

### Step 3: Validate
1. Check that all files are generated correctly
2. Verify test cases work with the generated boilerplates
3. Ensure no linting errors

### Step 4: Test Locally
1. Run the generated code with test cases
2. Verify input parsing works correctly
3. Verify output formatting matches expected format

### Step 5: Submit Pull Request
1. Create a feature branch: `git checkout -b feature/add-problem-name`
2. Commit all files: `git add . && git commit -m "Add problem: Problem Name"`
3. Push and create PR with description including:
   - Problem difficulty
   - Topic tags
   - Test case coverage
   - Any special considerations

## 📋 Checklist for Contributors

- [ ] Problem directory created with correct naming
- [ ] Problem_Description.md written with proper format
- [ ] Structure.md created with valid data types
- [ ] At least 5 comprehensive test cases created
- [ ] Editor boilerplates generated successfully
- [ ] Full boilerplates generated successfully
- [ ] All generated files are syntactically correct
- [ ] Test cases validated against boilerplates
- [ ] No linting errors in generated code
- [ ] Pull request created with proper description

## ⚠️ Important Notes

1. **Data Type Support:** Only use the supported data types listed above. For custom structures, they must be added to the boilerplate generators first.

2. **Input/Output Format:** Follow the exact input/output formats expected by the parsing logic. Inconsistent formats will cause runtime errors.

3. **Test Case Quality:** Poor test cases will be rejected. Ensure comprehensive coverage including edge cases.

4. **Boilerplate Modification:** Do not manually edit generated boilerplate files. If you need changes to the generation logic, modify the generator scripts.

5. **Consistency:** Maintain consistency with existing problems in terms of naming, formatting, and structure.

## 🆘 Need Help?

If you encounter issues:
1. Check existing problems for reference
2. Review this guide thoroughly
3. Ask in the project discussions
4. Ensure you're using the latest generator scripts

