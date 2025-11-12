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
    vector<int> nums;
    string line_nums;
    getline(cin, line_nums);
    istringstream iss_nums(line_nums);
    int num_nums;
    while(iss_nums >> num_nums) nums.push_back(num_nums);
    int k;
    cin >> k;

    Solution solver;
    int result = solver.minChanges(nums, k);
    cout<<result<<endl;
    return 0;
}