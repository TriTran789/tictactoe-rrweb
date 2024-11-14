"use client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import Content from "./content";

const page = async () => {
  return (
    <div className="p-12 pt-32 w-full relative">
      <Link
        href={"/"}
        className="absolute top-10 left-10 size-12 hover:bg-white/80 hover:cursor-pointer bg-white rounded-full flex justify-center items-center"
      >
        <ChevronLeft className="stroke-black" />
      </Link>
      <Content />
    </div>
  );
};

export default page;
