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
    vector<int> arr;
    string line_arr;
    getline(cin, line_arr);
    istringstream iss_arr(line_arr);
    int num_arr;
    while(iss_arr >> num_arr) arr.push_back(num_arr);
    int target;
    cin >> target;

    Solution solver;
    int result = solver.twoSum(arr, target);
    cout<<result<<endl;
    return 0;
}