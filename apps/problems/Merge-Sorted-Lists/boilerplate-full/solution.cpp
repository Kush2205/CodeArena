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
    vector<int> list1;
    string line_list1;
    getline(cin, line_list1);
    istringstream iss_list1(line_list1);
    int num_list1;
    while(iss_list1 >> num_list1) list1.push_back(num_list1);
    vector<int> list2;
    string line_list2;
    getline(cin, line_list2);
    istringstream iss_list2(line_list2);
    int num_list2;
    while(iss_list2 >> num_list2) list2.push_back(num_list2);

    Solution solver;
    vector<int> result = solver.mergeSortedLists(list1, list2);
    for(size_t i = 0; i < result.size(); i++){ if(i>0) cout<<" "; cout<<result[i]; }
    cout<<endl;
    return 0;
}