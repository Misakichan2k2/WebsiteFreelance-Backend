import express from "express";
import multer from "multer";
import path from "path";
import {
  createPayment,
  getAllPayments,
  getPaymentDetails,
  updatePaymentStatus,
  getPaymentsByStatus,
  getPendingPaymentsCount,
  getHistoryPaymentsCount,
} from "../controllers/paymentController.js";

const router = express.Router();

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/postImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

router.get("/", getAllPayments);
router.post("/create", upload.single("image"), createPayment);
router.get("/pending-count", getPendingPaymentsCount);
router.get("/history-count", getHistoryPaymentsCount);
router.get("/status", getPaymentsByStatus);
router.get("/:invoiceId", getPaymentDetails);
router.put("/:invoiceId/status", updatePaymentStatus);

export default router;
