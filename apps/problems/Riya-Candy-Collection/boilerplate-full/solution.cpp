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
    string favorites;
    getline(cin, favorites);
    string candies;
    getline(cin, candies);

    Solution solver;
    int result = solver.countFavoriteCandies(favorites, candies);
    cout<<result<<endl;
    return 0;
}