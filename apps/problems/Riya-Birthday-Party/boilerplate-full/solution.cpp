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
    vector<int> favorite;
    string line_favorite;
    getline(cin, line_favorite);
    istringstream iss_favorite(line_favorite);
    int num_favorite;
    while(iss_favorite >> num_favorite) favorite.push_back(num_favorite);

    Solution solver;
    int result = solver.maximumInvitations(favorite);
    cout<<result<<endl;
    return 0;
}