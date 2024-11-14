"use server";

import dbConnect from "@/lib/db";
import Record from "@/models/record";

export const addRecord = async (record: object[]) => {
  await dbConnect();
  const newRecord = new Record({ data: record });
  return newRecord.save();
};

export const getRecords = async () => {
  await dbConnect();
  const records = await Record.find({});
  console.log(records);
  return records;
};

export const getRecord = async (recordId: string) => {
  await dbConnect();
  const record = await Record.findById(recordId);
  console.log(record);
  return record;
};
