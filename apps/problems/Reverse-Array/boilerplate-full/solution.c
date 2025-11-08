#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
        char line_arr[10000];
        fgets(line_arr, sizeof(line_arr), stdin);
        int arr_size = 0;
        int* arr = (int*)malloc(1000 * sizeof(int));
        char* token = strtok(line_arr, " \t\n");
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