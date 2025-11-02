#include <iostream>
#include <vector>
#include <string>
#include <sstream>
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

    Solution solver;
    int result = solver.sumOfArray(arr);
    cout<<result<<endl;
    return 0;
}