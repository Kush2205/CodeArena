#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};

struct TreeNode* buildTree(char* data) {
    if (!data || strcmp(data, "null") == 0) return NULL;
    char* token = strtok(data, ",");
    if (!token) return NULL;
    struct TreeNode* root = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    root->val = atoi(token);
    root->left = root->right = NULL;
    struct TreeNode** queue = (struct TreeNode**)malloc(10000 * sizeof(struct TreeNode*));
    int front = 0, rear = 0;
    queue[rear++] = root;
    while (front < rear) {
        struct TreeNode* node = queue[front++];
        token = strtok(NULL, ",");
        if (token && strcmp(token, "null") != 0) {
            node->left = (struct TreeNode*)malloc(sizeof(struct TreeNode));
            node->left->val = atoi(token);
            node->left->left = node->left->right = NULL;
            queue[rear++] = node->left;
        }
        token = strtok(NULL, ",");
        if (token && strcmp(token, "null") != 0) {
            node->right = (struct TreeNode*)malloc(sizeof(struct TreeNode));
            node->right->val = atoi(token);
            node->right->left = node->right->right = NULL;
            queue[rear++] = node->right;
        }
    }
    free(queue);
    return root;
}

void printTree(struct TreeNode* root) {
    if (!root) return;
    struct TreeNode** queue = (struct TreeNode**)malloc(10000 * sizeof(struct TreeNode*));
    int front = 0, rear = 0;
    queue[rear++] = root;
    int* values = (int*)malloc(10000 * sizeof(int));
    int valueCount = 0;
    while (front < rear) {
        struct TreeNode* node = queue[front++];
        if (node) {
            values[valueCount++] = node->val;
            queue[rear++] = node->left;
            queue[rear++] = node->right;
        } else {
            values[valueCount++] = -1; // sentinel for null
        }
    }
    while (valueCount > 0 && values[valueCount-1] == -1) valueCount--;
    for (int i = 0; i < valueCount; i++) {
        if (i > 0) printf(" ");
        if (values[i] == -1) printf("null");
        else printf("%d", values[i]);
    }
    printf("\n");
    free(queue);
    free(values);
}

// User Code Starts

// User Code Ends

int main() {
        char root_str[10000];
        scanf("%s", root_str);
        struct TreeNode* root = buildTree(root_str);

    int returnSize = 0;
    int* result = inorderTraversal(root, &returnSize);
    for(int i=0; i<returnSize; i++) {
        if(i>0) printf(" ");
        printf("%d", result[i]);
    }
    printf("\n");
    return 0;
}