import { getRecord } from "@/actions/record";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { eventWithTime } from "@rrweb/types";
import Player from "@/components/Player";

const page = async ({ params }: { params: { recordId: string } }) => {
  const record = await getRecord(params.recordId);
  const events = record?.data as eventWithTime[];

  return (
    <div className="p-12 relative w-full h-screen">
      <Link
        href={"/history"}
        className="top-10 left-10 size-12 flex justify-center items-center bg-white absolute rounded-full hover:bg-white/80 cursor-pointer"
      >
        <ChevronLeft className="stroke-black" />
      </Link>
      <Player events={events} />
    </div>
  );
};

export default page;
