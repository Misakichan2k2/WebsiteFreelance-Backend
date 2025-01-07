import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
  {
    postBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với model User
      required: true,
    },
    postId: {
      type: String,
      unique: true,
      required: true,
    },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    budget: { type: Number, required: true },
    engAvailable: { type: Boolean, default: false },
    category: { type: String, required: true },
    sampleWork: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Approved", "Rejected", "Pending"],
      default: "Pending",
    },
    imagePath: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Freelancer = mongoose.model("Freelancer", freelancerSchema);
export default Freelancer;
