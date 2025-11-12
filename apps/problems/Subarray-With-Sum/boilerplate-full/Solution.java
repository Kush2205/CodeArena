import java.util.*;

// User Code Starts
// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        String line_arr = scanner.nextLine();
        String[] tokens_arr = line_arr.trim().split("\\s+");
        int[] arr = new int[tokens_arr.length];
        for(int i=0;i<tokens_arr.length;i++){
            arr[i] = Integer.parseInt(tokens_arr[i]);
        }
        double target = scanner.nextDouble();
        Solution solver = new Solution();
        double result = solver.subArraySum(arr, target);
        System.out.println(result);
        scanner.close();
    }
}