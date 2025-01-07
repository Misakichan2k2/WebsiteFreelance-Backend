import mongoose from "mongoose";

const freelancerProfileSchema = new mongoose.Schema(
  {
    userProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với model User
      required: true,
    },
    FRV: { type: String, required: true }, //freelancer verification code
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Verified", "Rejected", "Pending"],
      default: "Pending",
    },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    bankAccountName: { type: String, required: true },
    fullName: { type: String, required: true },
    idCardNumber: { type: String, required: true },
    imagePath: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const freelancerProfile = mongoose.model(
  "freelancerProfile",
  freelancerProfileSchema
);
export default freelancerProfile;
