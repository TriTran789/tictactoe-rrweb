"use server";

import dbConnect from "@/lib/db";
import Record from "@/models/record";

export const addRecord = async (record: object[]) => {
  const newRecord = new Record({ data: record });
  return newRecord.save();
};

export const getRecords = async () => {
  await dbConnect();
  const records = await Record.find({});
  return records;
};

export const getRecord = async (recordId: string) => {
  const record = await Record.findById(recordId);
  return record;
};
