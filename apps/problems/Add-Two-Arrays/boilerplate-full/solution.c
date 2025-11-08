#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
        char line_a[10000];
        fgets(line_a, sizeof(line_a), stdin);
        int a_size = 0;
        int* a = (int*)malloc(1000 * sizeof(int));
        char* token = strtok(line_a, " \t\n");
        while (token != NULL) {
            a[a_size++] = atoi(token);
            token = strtok(NULL, " \t\n");
        }
        char line_b[10000];
        fgets(line_b, sizeof(line_b), stdin);
        int b_size = 0;
        int* b = (int*)malloc(1000 * sizeof(int));
        char* token = strtok(line_b, " \t\n");
        while (token != NULL) {
            b[b_size++] = atoi(token);
            token = strtok(NULL, " \t\n");
        }

    int returnSize = 0;
    int* result = addTwoArrays(a, a_size, b, b_size, &returnSize);
    for(int i=0; i<returnSize; i++) {
        if(i>0) printf(" ");
        printf("%d", result[i]);
    }
    printf("\n");
    return 0;
}