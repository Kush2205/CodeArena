#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
    char* token = NULL;
        int graph_vertices;
        scanf("%d", &graph_vertices);
        // Create adjacency matrix (n x n)
        int** graph = (int**)malloc(graph_vertices * sizeof(int*));
        for(int i=0; i<graph_vertices; i++) {
            graph[i] = (int*)calloc(graph_vertices, sizeof(int));
        }
        // Read adjacency list and convert to matrix
        for(int i=0; i<graph_vertices; i++) {
            char* line = (char*)malloc(1000000 * sizeof(char));
            scanf(" ");
            fgets(line, 1000000, stdin);
            token = strtok(line, " \t\n");
            while (token != NULL) {
                int neighbor = atoi(token);
                graph[i][neighbor] = 1;
                token = strtok(NULL, " \t\n");
            }
        }
        int start;
        scanf("%d", &start);

    int returnSize = 0;
    int* result = graphBFSTraversal(graph, graph_vertices, start, &returnSize);
    for(int i=0; i<returnSize; i++) {
        if(i>0) printf(" ");
        printf("%d", result[i]);
    }
    printf("\n");
    return 0;
}