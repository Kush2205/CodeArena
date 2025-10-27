import java.util.*;

// User Code Starts

// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        String line_a = scanner.nextLine();
        String[] tokens_a = line_a.trim().split("\\s+");
        int[] a = new int[tokens_a.length];
        for(int i=0;i<tokens_a.length;i++){
            a[i] = Integer.parseInt(tokens_a[i]);
        }
        String line_b = scanner.nextLine();
        String[] tokens_b = line_b.trim().split("\\s+");
        int[] b = new int[tokens_b.length];
        for(int i=0;i<tokens_b.length;i++){
            b[i] = Integer.parseInt(tokens_b[i]);
        }

        Solution solver = new Solution();
        int[] result = solver.addTwoArrays(a, b);
        for(int i=0;i<result.length;i++){ if(i>0) System.out.print(" "); System.out.print(result[i]); }
        System.out.println();
        scanner.close();
    }
}