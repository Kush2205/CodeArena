#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
        char* favorites = (char*)malloc(20000000 * sizeof(char));
        scanf("%s", favorites);
        char* candies = (char*)malloc(20000000 * sizeof(char));
        scanf("%s", candies);

    int result = countFavoriteCandies(favorites, candies);
    printf("%d\n", result);
    return 0;
}