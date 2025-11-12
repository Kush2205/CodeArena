"use client";
import { useRouter } from "next/navigation";
export default function Page() {
 const router = useRouter();
  return (
   <div className="w-full h-screen flex justify-center items-center gap-x-5">
       <button onClick={() => router.push('/signin')} className="bg-blue-500 text-white px-4 py-2 rounded hover:cursor-pointer">Sign In</button>
       <button onClick={() => router.push('/signup')} className="bg-green-500 text-white px-4 py-2 rounded hover:cursor-pointer">Sign Up</button>
   </div>
  );
}
