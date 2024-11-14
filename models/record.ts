import mongoose, { Schema, Document, Model } from "mongoose";

interface RecordDocument extends Document {
  data: object[];
  createdAt: Date;
  updatedAt: Date;
}

const recordSchema: Schema<RecordDocument> = new mongoose.Schema(
  {
    data: {
      type: [Schema.Types.Mixed],
      required: true,
    },
  },
  { timestamps: true, bufferCommands: false } // Enable timestamps
);

const Record: Model<RecordDocument> =
  mongoose.models.Record ||
  mongoose.model<RecordDocument>("Record", recordSchema);

export default Record;
