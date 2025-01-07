import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Bài đăng liên quan
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost", // Liên kết đến JobPost
      required: true,
    },
    // Minh chứng chuyển khoản
    imagePath: {
      type: String,
      required: false,
    },
    invoiceId: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
