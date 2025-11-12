import fs from "fs";
import path from "path";
import { ProblemStatement } from "./ProblemStatement";

export const ProblemStatementWrapper = ({ 
    problemName, 
    contestId, 
    difficulty, 
    totalPoints 
}: { 
    problemName: string; 
    contestId: string | undefined;
    difficulty?: string;
    totalPoints?: number;
}) => {
    const problemPath = path.join(
        process.cwd(),
        "..",
        "problems",
        problemName,
        "Problem_Description.md"
    );

    if (!fs.existsSync(problemPath)) {
        return (
            <div className="p-6 w-[50%] h-screen overflow-y-scroll bg-neutral-900 text-neutral-200">
                Problem statement not found for <code>{problemName}</code>.
            </div>
        );
    }

    const content = fs.readFileSync(problemPath, "utf-8");

    return (
        <ProblemStatement 
            content={content} 
            contestId={contestId} 
            problemName={problemName}
            difficulty={difficulty}
            totalPoints={totalPoints}
        />
    );
};
