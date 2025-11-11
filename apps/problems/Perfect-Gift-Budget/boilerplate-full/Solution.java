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
        for(int i=0;i<result.length;i++){ for(int j=0;j<result[i].length;j++){ if(j>0) System.out.print(" "); System.out.print(result[i][j]); } System.out.println(); }
        scanner.close();
    }
}