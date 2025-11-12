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
        Solution solver = new Solution();
        int[] result = solver.reverseArray(arr);
        for(int i=0;i<result.length;i++){ if(i>0) System.out.print(" "); System.out.print(result[i]); }
        System.out.println();
        scanner.close();
    }
}