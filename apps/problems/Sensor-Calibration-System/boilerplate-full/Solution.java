import java.util.*;

// User Code Starts
// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        String line_nums = scanner.nextLine();
        String[] tokens_nums = line_nums.trim().split("\\s+");
        int[] nums = new int[tokens_nums.length];
        for(int i=0;i<tokens_nums.length;i++){
            nums[i] = Integer.parseInt(tokens_nums[i]);
        }
        int k = scanner.nextInt();
        Solution solver = new Solution();
        int result = solver.minChanges(nums, k);
        System.out.println(result);
        scanner.close();
    }
}