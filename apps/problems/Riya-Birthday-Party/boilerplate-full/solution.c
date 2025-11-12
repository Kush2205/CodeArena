#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
        char line_favorite[10000];
        fgets(line_favorite, sizeof(line_favorite), stdin);
        int favorite_size = 0;
        int* favorite = (int*)malloc(1000 * sizeof(int));
        char* token = strtok(line_favorite, " \t\n");
        while (token != NULL) {
            favorite[favorite_size++] = atoi(token);
            token = strtok(NULL, " \t\n");
        }

    int result = maximumInvitations(favorite, favorite_size);
    printf("%d\n", result);
    return 0;
}