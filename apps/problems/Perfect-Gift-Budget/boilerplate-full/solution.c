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
    int[][] result = findGiftCombinations(k, n, &returnSize);
    for(int i=0; i<returnSize; i++) {
        if(i>0) printf(" ");
        printf("%d", result[i]);
    }
    printf("\n");
    return 0;
}