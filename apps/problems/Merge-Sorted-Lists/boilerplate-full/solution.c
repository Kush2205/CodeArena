#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
        char line_list1[10000];
        fgets(line_list1, sizeof(line_list1), stdin);
        int list1_size = 0;
        int* list1 = (int*)malloc(1000 * sizeof(int));
        char* token = strtok(line_list1, " \t\n");
        while (token != NULL) {
            list1[list1_size++] = atoi(token);
            token = strtok(NULL, " \t\n");
        }
        char line_list2[10000];
        fgets(line_list2, sizeof(line_list2), stdin);
        int list2_size = 0;
        int* list2 = (int*)malloc(1000 * sizeof(int));
        char* token = strtok(line_list2, " \t\n");
        while (token != NULL) {
            list2[list2_size++] = atoi(token);
            token = strtok(NULL, " \t\n");
        }

    int returnSize = 0;
    int* result = mergeSortedLists(list1, list1_size, list2, list2_size, &returnSize);
    for(int i=0; i<returnSize; i++) {
        if(i>0) printf(" ");
        printf("%d", result[i]);
    }
    printf("\n");
    return 0;
}