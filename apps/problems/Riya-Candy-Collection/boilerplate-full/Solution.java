import java.util.*;

// User Code Starts
// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        String favorites = scanner.nextLine();
        String candies = scanner.nextLine();
        Solution solver = new Solution();
        int result = solver.countFavoriteCandies(favorites, candies);
        System.out.println(result);
        scanner.close();
    }
}