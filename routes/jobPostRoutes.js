import express from "express";
import {
  createJobPost,
  getJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  getJobPostCount,
  updateJobPostStatus,
  getApprovedJobPosts,
  applyForJob,
  getInterestedFreelancers,
  acceptFreelancer,
} from "../controllers/jobPostController.js";

const router = express.Router();

router.get("/count", getJobPostCount);
router.post("/", createJobPost);
router.get("/approved", getApprovedJobPosts);
router.get("/", getJobPosts);
router.get("/:id", getJobPostById);
router.put("/:postId", updateJobPost);
router.put("/:postId/status", updateJobPostStatus);
router.delete("/:id", deleteJobPost);
router.post("/:postId/apply", applyForJob);
router.get("/:postId/interested-freelancers", getInterestedFreelancers);
router.post("/:postId/accept", acceptFreelancer);

export default router;
