#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
        int k;
        scanf("%d", &k);
        int n;
        scanf("%d", &n);

    int returnSize = 0;
    int* returnColumnSizes = NULL;
    int** result = findGiftCombinations(k, n, &returnSize, &returnColumnSizes);
    for(int i=0; i<returnSize; i++) {
        for(int j=0; j<returnColumnSizes[i]; j++) {
            if(j>0) printf(" ");
            printf("%d", result[i][j]);
        }
        printf("\n");
    }
    return 0;
}