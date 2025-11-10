import java.util.*;

// User Code Starts
// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        String line_list1 = scanner.nextLine();
        String[] tokens_list1 = line_list1.trim().split("\\s+");
        int[] list1 = new int[tokens_list1.length];
        for(int i=0;i<tokens_list1.length;i++){
            list1[i] = Integer.parseInt(tokens_list1[i]);
        }
        String line_list2 = scanner.nextLine();
        String[] tokens_list2 = line_list2.trim().split("\\s+");
        int[] list2 = new int[tokens_list2.length];
        for(int i=0;i<tokens_list2.length;i++){
            list2[i] = Integer.parseInt(tokens_list2[i]);
        }
        Solution solver = new Solution();
        int[] result = solver.mergeSortedLists(list1, list2);
        for(int i=0;i<result.length;i++){ if(i>0) System.out.print(" "); System.out.print(result[i]); }
        System.out.println();
        scanner.close();
    }
}