import java.util.*;

// User Code Starts
// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        int k = scanner.nextInt();
        int n = scanner.nextInt();
        Solution solver = new Solution();
        int[][] result = solver.findGiftCombinations(k, n);
        for(int[] row : result){ for(int val : row) System.out.print(val + " "); System.out.println(); }
        scanner.close();
    }
}