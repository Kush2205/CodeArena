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
#include <utility>
using namespace std;

// User Code Starts

// User Code Ends

int main(){
    vector<int> a;
    string line_a;
    getline(cin, line_a);
    istringstream iss_a(line_a);
    int num_a;
    while(iss_a >> num_a) a.push_back(num_a);
    vector<int> b;
    string line_b;
    getline(cin, line_b);
    istringstream iss_b(line_b);
    int num_b;
    while(iss_b >> num_b) b.push_back(num_b);

    Solution solver;
    vector<int> result = solver.addTwoArrays(a, b);
    for(size_t i = 0; i < result.size(); i++){ if(i>0) cout<<" "; cout<<result[i]; }
    cout<<endl;
    return 0;
}