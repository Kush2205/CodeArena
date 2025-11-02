"use client";
import ProblemsPage from "./components/ProblemsPage";
import { useParams } from "next/navigation";



interface Props {}

function page(props: Props) {
     const {contestId} = useParams();

    return (
        <ProblemsPage contestId={contestId as string}/>
    )
}

export default page;
