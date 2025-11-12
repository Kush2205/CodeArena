import java.util.*;

// User Code Starts
// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        String line_favorite = scanner.nextLine();
        String[] tokens_favorite = line_favorite.trim().split("\\s+");
        int[] favorite = new int[tokens_favorite.length];
        for(int i=0;i<tokens_favorite.length;i++){
            favorite[i] = Integer.parseInt(tokens_favorite[i]);
        }
        Solution solver = new Solution();
        int result = solver.maximumInvitations(favorite);
        System.out.println(result);
        scanner.close();
    }
}