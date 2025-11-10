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
    int[][] result = solver.findGiftCombinations(k, n);
    for(size_t i = 0; i < result.size(); i++){ if(i>0) cout<<" "; cout<<result[i]; }
    cout<<endl;
    return 0;
}