import { getRecord } from "@/actions/record";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import rrwebPlayer from "rrweb-player";

const page = async ({ params }: { params: { recordId: string } }) => {
  const record = await getRecord(params.recordId);

  return (
    <div className="p-12 pt-32 relative w-full">
      <Link href={"/history"} className="top-10 left-10 size-12 flex justify-center items-center bg-white absolute rounded-full hover:bg-white/80 cursor-pointer">
        <ChevronLeft className="stroke-black" />
      </Link>
      <div className=""></div>
    </div>
  );
};

export default page;
