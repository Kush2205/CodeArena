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
    int vertices_graph;
    cin >> vertices_graph;
    vector<vector<int>> graph(vertices_graph);
    string dummy;
    getline(cin, dummy);
    for(int i=0; i<vertices_graph; i++) {
        string line;
        getline(cin, line);
        istringstream iss(line);
        int neighbor;
        while(iss >> neighbor) graph[i].push_back(neighbor);
    }
    int start;
    cin >> start;

    Solution solver;
    vector<int> result = solver.graphBFSTraversal(graph, start);
    for(size_t i = 0; i < result.size(); i++){ if(i>0) cout<<" "; cout<<result[i]; }
    cout<<endl;
    return 0;
}