import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { generateFullCode } from "../../../../utils/generateFullCode";
import { generateTestCases } from "../../../../utils/generateTestCases";
export async function POST(req: NextRequest) {
  try {
    const { source_code, language, problemName } = await req.json();

    const judgeCode = generateFullCode(source_code, language, problemName);
    const testCases = generateTestCases(problemName);
    console.log("Test Cases:", testCases);
    console.log("Generated Judge Code:", judgeCode);
    
    let judge0Res:any = [];

    testCases.map(async (testCase) => {
       
      const res = await axios.post(process.env.JUDGE0_URI + "/submissions?base64_encoded=false&wait=true", {
        source_code: judgeCode,
        language_id: language === "cpp" ? 54 : language === "python" ? 71 : language === "java" ? 62 : 63,
        stdin: testCase.input,
        expected_output: testCase.output,
      });
      console.log(res.data)

    })
    

    return NextResponse.json(judge0Res);
  } catch (error) {
    console.error("Error generating judge code:", error);
    return NextResponse.json({ error: "Failed to generate judge code" }, { status: 500 });
  }
}
