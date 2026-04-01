import { Schema, model } from "mongoose";

const CandidateSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    status: {
      type: String,
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Candidate = model("Candidate", CandidateSchema);
