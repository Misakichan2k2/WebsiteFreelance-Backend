import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  getAccountCount,
  getFreelancerCount,
} from "../controllers/userController.js";
import { verifyToken } from "../utils/verifyUser.js";

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

// Routes
router.get("/", getAllUsers);
router.get("/accounts/count", getAccountCount);
router.get("/accounts/freelancer-count", getFreelancerCount);
router.get("/:userId", getUserById);
router.delete("/:userId", deleteUser);
router.put("/:userId", upload.single("image"), updateUser);

export default router;
