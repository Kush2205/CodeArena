#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// User Code Starts

// User Code Ends

int main() {
        char favorites[1000];
        scanf("%s", favorites);
        char candies[1000];
        scanf("%s", candies);

    int result = countFavoriteCandies(favorites, candies);
    printf("%d\n", result);
    return 0;
}