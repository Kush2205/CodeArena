#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
    char* token = NULL;
        char* line_nums = (char*)malloc(1000000 * sizeof(char));
        fgets(line_nums, 1000000, stdin);
        int nums_size = 0;
        int* nums = (int*)malloc(100000 * sizeof(int));
        token = strtok(line_nums, " \t\n");
        while (token != NULL) {
            nums[nums_size++] = atoi(token);
            token = strtok(NULL, " \t\n");
        }
        int k;
        scanf("%d", &k);

    int result = minChanges(nums, nums_size, k);
    printf("%d\n", result);
    return 0;
}