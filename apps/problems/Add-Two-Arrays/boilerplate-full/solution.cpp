#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

// User Code Starts

// User Code Ends

int main(){
    vector<int> a;
    string line_a;
    getline(cin, line_a);
    istringstream iss_a(line_a);
    int num;
    while(iss_a >> num) a.push_back(num);
    vector<int> b;
    string line_b;
    getline(cin, line_b);
    istringstream iss_b(line_b);
    int num;
    while(iss_b >> num) b.push_back(num);

    Solution solver;
    vector<int> result = solver.addTwoArrays(a, b);
    for(size_t i = 0; i < result.size(); i++){ if(i>0) cout<<" "; cout<<result[i]; }
    cout<<endl;
    return 0;
}