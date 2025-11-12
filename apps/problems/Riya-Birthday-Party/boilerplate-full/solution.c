#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
    char* token = NULL;
        char* line_favorite = (char*)malloc(1000000 * sizeof(char));
        fgets(line_favorite, 1000000, stdin);
        int favorite_size = 0;
        int* favorite = (int*)malloc(100000 * sizeof(int));
        token = strtok(line_favorite, " \t\n");
        while (token != NULL) {
            favorite[favorite_size++] = atoi(token);
            token = strtok(NULL, " \t\n");
        }

    int result = maximumInvitations(favorite, favorite_size);
    printf("%d\n", result);
    return 0;
}