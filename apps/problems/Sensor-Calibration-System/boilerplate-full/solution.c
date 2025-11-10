#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
        char line_nums[10000];
        fgets(line_nums, sizeof(line_nums), stdin);
        int nums_size = 0;
        int* nums = (int*)malloc(1000 * sizeof(int));
        char* token = strtok(line_nums, " \t\n");
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