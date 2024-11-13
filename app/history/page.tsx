import { getRecords } from "@/actions/record";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = async () => {
  const records = await getRecords();

  return (
    <div className="p-12 pt-32 w-full relative">
      <Link
        href={"/"}
        className="absolute top-10 left-10 size-12 hover:bg-white/80 hover:cursor-pointer bg-white rounded-full flex justify-center items-center"
      >
        <ChevronLeft className="stroke-black" />
      </Link>
      <div className="w-full grid grid-cols-4 gap-20">
        {records.map((record, index) => (
          <>
            <Link
              href={`/history/${record._id}`}
              className="h-44 border rounded-3xl flex justify-center items-center shadow shadow-white hover:cursor-pointer hover:bg-white/5"
            >
              <span className="text-2xl font-bold">{`Record ${
                index + 1
              }`}</span>
            </Link>
          </>
        ))}
      </div>
    </div>
  );
};

export default page;
