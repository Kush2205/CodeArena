#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
    char* token = NULL;
        char* line_arr = (char*)malloc(1000000 * sizeof(char));
        fgets(line_arr, 1000000, stdin);
        int arr_size = 0;
        int* arr = (int*)malloc(100000 * sizeof(int));
        token = strtok(line_arr, " \t\n");
        while (token != NULL) {
            arr[arr_size++] = atoi(token);
            token = strtok(NULL, " \t\n");
        }

    int returnSize = 0;
    int* result = reverseArray(arr, arr_size, &returnSize);
    for(int i=0; i<returnSize; i++) {
        if(i>0) printf(" ");
        printf("%d", result[i]);
    }
    printf("\n");
    return 0;
}