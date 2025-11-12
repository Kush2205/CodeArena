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

// User Code Starts

// User Code Ends

int main(){
    int k;
    cin >> k;
    int n;
    cin >> n;

    Solution solver;
    vector<vector<int>> result = solver.findGiftCombinations(k, n);
    for(const auto& row : result) {
        for(size_t i = 0; i < row.size(); ++i) {
            if(i) cout << " ";
            cout << row[i];
        }
        cout << endl;
    }

    return 0;
}