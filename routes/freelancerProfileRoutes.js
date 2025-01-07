import express from "express";
import multer from "multer";
import path from "path";
import {
  createFreelancerProfile,
  getAllFreelancerProfiles,
  getFreelancerProfileById,
  updateFreelancerStatus,
  countFreelancerProfiles,
} from "../controllers/FreelancerProfileController.js";

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

router.get("/count", countFreelancerProfiles);
router.post("/", upload.single("image"), createFreelancerProfile);
router.get("/", getAllFreelancerProfiles);
router.get("/:id", getFreelancerProfileById);
router.put("/:FRV/status", updateFreelancerStatus);

export default router;
