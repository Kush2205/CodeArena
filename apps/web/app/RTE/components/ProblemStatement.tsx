
import fs from "fs";
import path from "path";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";


export const ProblemStatement = ({ problemName }: { problemName: string }) => {
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
    <div className=" w-[50vw]  h-full overflow-y-auto bg-neutral-900 p-6 border-b border-neutral-800 lg:border-b-0 lg:border-r">
            <article className="prose prose-invert prose-neutral max-w-none
                    prose-headings:text-white prose-headings:font-bold
                    prose-h2:text-2xl prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
                    prose-h5:text-base prose-h5:mt-3 prose-h5:mb-2 prose-h5:text-neutral-400
                    prose-p:text-neutral-300 prose-p:leading-7
                    prose-code:bg-neutral-800 prose-code:text-neutral-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-neutral-800 prose-pre:border prose-pre:border-neutral-700 prose-pre:rounded-lg
                    prose-strong:text-white prose-strong:font-semibold
                    prose-ul:list-disc prose-ul:ml-6 prose-ul:text-neutral-300
                    prose-ol:list-decimal prose-ol:ml-6 prose-ol:text-neutral-300
                    prose-li:text-neutral-300
                    prose-blockquote:border-l-4 prose-blockquote:border-neutral-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-400
                ">
                <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                >
                    {content}
                </Markdown>
            </article>
        </div>
    );
};