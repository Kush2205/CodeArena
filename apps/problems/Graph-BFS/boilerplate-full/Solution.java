import java.util.*;

// User Code Starts
// User Code Ends

public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        int vertices_graph = scanner.nextInt();
        List<List<Integer>> graph = new ArrayList<>();
        scanner.nextLine(); // consume newline
        for(int i=0; i<vertices_graph; i++) {
            String line = scanner.nextLine();
            List<Integer> neighbors = new ArrayList<>();
            for(String token : line.trim().split("\\s+")) neighbors.add(Integer.parseInt(token));
            graph.add(neighbors);
        }
        int start = scanner.nextInt();
        Solution solver = new Solution();
        int[] result = solver.graphBFSTraversal(graph, start);
        for(int i=0;i<result.length;i++){ if(i>0) System.out.print(" "); System.out.print(result[i]); }
        System.out.println();
        scanner.close();
    }
}