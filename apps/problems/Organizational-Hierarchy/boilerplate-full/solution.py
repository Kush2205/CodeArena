from typing import Optional, List
class TreeNode:
    def __init__(self, val: int = 0, left: Optional['TreeNode'] = None, right: Optional['TreeNode'] = None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(data: str) -> Optional[TreeNode]:
    if not data or data == "null":
        return None
    tokens = data.split(',')
    tokens = [t.strip() for t in tokens]
    if not tokens or tokens[0] == "null":
        return None
    root = TreeNode(int(tokens[0]))
    queue = [root]
    i = 1
    while queue and i < len(tokens):
        node = queue.pop(0)
        if i < len(tokens) and tokens[i] != "null":
            node.left = TreeNode(int(tokens[i]))
            queue.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != "null":
            node.right = TreeNode(int(tokens[i]))
            queue.append(node.right)
        i += 1
    return root

def print_tree(root: Optional[TreeNode]) -> None:
    if not root:
        return
    queue = [root]
    values = []
    while queue:
        node = queue.pop(0)
        if node:
            values.append(str(node.val))
            queue.append(node.left)
            queue.append(node.right)
        else:
            values.append("null")
    while values and values[-1] == "null":
        values.pop()
    print(' '.join(values))

# User Code Starts
# User Code Ends

if __name__ == "__main__":
    line = input().strip()
    root = build_tree(line)
    solver = Solution()
    result = solver.levelOrderTraversal(root)
    print(' '.join(map(str, result)))
