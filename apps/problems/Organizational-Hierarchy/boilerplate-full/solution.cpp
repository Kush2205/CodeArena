#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <queue>
#include <stack>
#include <deque>
#include <list>
#include <cmath>
#include <climits>
#include <cfloat>
#include <cstring>
#include <numeric>
#include <functional>
#include <bits/stdc++.h>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

TreeNode* buildTreeFromArray(vector<string>& nodes, int index) {
    if (index >= nodes.size() || nodes[index] == "null") {
        return nullptr;
    }
    TreeNode* root = new TreeNode(stoi(nodes[index]));
    root->left = buildTreeFromArray(nodes, 2 * index + 1);
    root->right = buildTreeFromArray(nodes, 2 * index + 2);
    return root;
}

TreeNode* buildTree(string data) {
    if (data.empty() || data == "null") return nullptr;
    vector<string> tokens;
    stringstream ss(data);
    string token;
    while (getline(ss, token, ',')) {
        tokens.push_back(token);
    }
    // Trim whitespace from tokens
    for (auto& t : tokens) {
        t.erase(t.begin(), find_if(t.begin(), t.end(), [](int ch) { return !isspace(ch); }));
        t.erase(find_if(t.rbegin(), t.rend(), [](int ch) { return !isspace(ch); }).base(), t.end());
    }
    if (tokens.empty() || tokens[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t index = 1;
    while (!q.empty() && index < tokens.size()) {
        TreeNode* node = q.front();
        q.pop();
        if (index < tokens.size() && tokens[index] != "null") {
            node->left = new TreeNode(stoi(tokens[index]));
            q.push(node->left);
        }
        ++index;
        if (index < tokens.size() && tokens[index] != "null") {
            node->right = new TreeNode(stoi(tokens[index]));
            q.push(node->right);
        }
        ++index;
    }
    return root;
}

void printTree(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);
    vector<string> values;
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        if (node) {
            values.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            values.push_back("null");
        }
    }
    while (!values.empty() && values.back() == "null") values.pop_back();
    for (size_t i = 0; i < values.size(); ++i) {
        if (i) cout << " ";
        cout << values[i];
    }
    cout << endl;
}

// User Code Starts

// User Code Ends

int main(){
    vector<string> tree_root;
    string line_root;
    getline(cin, line_root);
    istringstream iss_root(line_root);
    string node_root;
    while(iss_root >> node_root) tree_root.push_back(node_root);
    TreeNode* root = tree_root.empty() ? nullptr : buildTreeFromArray(tree_root, 0);

    Solution solver;
    vector<vector<int>> result = solver.levelOrderTraversal(root);
    for(const auto& row : result) {
        for(size_t i = 0; i < row.size(); ++i) {
            if(i) cout << " ";
            cout << row[i];
        }
        cout << endl;
    }

    return 0;
}