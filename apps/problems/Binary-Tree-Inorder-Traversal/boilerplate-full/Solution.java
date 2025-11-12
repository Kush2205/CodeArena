import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int val) { this.val = val; }
}

// User Code Starts
// User Code Ends

public class Main{
    static TreeNode buildTree(String data) {
        if (data == null || data.equals("null")) return null;
        String[] tokens = data.trim().split("\\s+");
        if (tokens.length == 0 || tokens[0].equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(tokens[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int i = 1;
        while (!queue.isEmpty() && i < tokens.length) {
            TreeNode node = queue.poll();
            if (i < tokens.length && !tokens[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(tokens[i]));
                queue.offer(node.left);
            }
            i++;
            if (i < tokens.length && !tokens[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(tokens[i]));
                queue.offer(node.right);
            }
            i++;
        }
        return root;
    }

    static String printTree(TreeNode root) {
        if (root == null) return "";
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        List<String> values = new ArrayList<>();
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node != null) {
                values.add(String.valueOf(node.val));
                queue.offer(node.left);
                queue.offer(node.right);
            } else {
                values.add("null");
            }
        }
        while (!values.isEmpty() && values.get(values.size() - 1).equals("null")) {
            values.remove(values.size() - 1);
        }
        return String.join(" ", values);
    }

    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        String line_root = scanner.nextLine();
        TreeNode root = buildTree(line_root);
        Solution solver = new Solution();
        int[] result = solver.inorderTraversal(root);
        for(int i=0;i<result.length;i++){ if(i>0) System.out.print(" "); System.out.print(result[i]); }
        System.out.println();
        scanner.close();
    }
}