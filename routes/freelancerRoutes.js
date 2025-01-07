import express from "express";
import multer from "multer";
import path from "path";
import {
  createFreelancerPost,
  getFreelancerPosts,
  getFreelancerPostById,
  updateFreelancerPost,
  updateFreelancerPostStatus,
  deleteFreelancerPost,
  getFreelancerPostCount,
  getApprovedFreelancerPosts,
  getRandomApprovedFreelancerPosts,
} from "../controllers/freelancerController.js";

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

// Route tạo bài đăng freelancer
router.get("/count", getFreelancerPostCount);
router.post("/", upload.single("image"), createFreelancerPost);
router.get("/approved", getApprovedFreelancerPosts);
router.get("/random", getRandomApprovedFreelancerPosts);
router.get("/", getFreelancerPosts);
router.get("/:id", getFreelancerPostById);
router.put("/:postId", upload.single("image"), updateFreelancerPost);
router.put("/:postId/status", updateFreelancerPostStatus);
router.delete("/:id", deleteFreelancerPost);

export default router;
