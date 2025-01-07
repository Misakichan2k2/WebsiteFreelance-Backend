import JobPost from "../models/JobPost.js";
import mongoose from "mongoose";

// Create a new job post
export const createJobPost = async (req, res) => {
  try {
    const count = await JobPost.countDocuments();
    const postId = `JP${(count + 1).toString().padStart(3, "0")}`;

    const newJobPost = new JobPost({
      ...req.body,
      postBy: req.body.postBy,
      postId: postId,
    });

    const savedJobPost = await newJobPost.save();
    res.status(201).json(savedJobPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all job posts
export const getJobPosts = async (req, res) => {
  try {
    const jobPosts = await JobPost.find()
      .populate("postBy", "username email role status userId avatar")
      .populate(
        "assignedFreelancer",
        "userId username email role status avatar"
      )
      .populate(
        "interestedFreelancers",
        "userId username email role status avatar"
      ); // Chỉ định các trường cần lấy từ User
    res.status(200).json(jobPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job posts with status "Approved" (for users)
export const getApprovedJobPosts = async (req, res) => {
  try {
    const jobPosts = await JobPost.find({ status: "Approved" })
      .populate("postBy", "username email role status userId avatar")
      .populate(
        "assignedFreelancer",
        "userId username email role status avatar"
      )
      .populate(
        "interestedFreelancers",
        "userId username email role status avatar"
      );
    res.status(200).json(jobPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single job post by ID
export const getJobPostById = async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.params.id)
      .populate("postBy", "userId username email role status avatar")
      .populate(
        "assignedFreelancer",
        "userId username email role status avatar"
      )
      .populate(
        "interestedFreelancers",
        "userId username email role status avatar"
      );
    if (!jobPost)
      return res.status(404).json({ message: "Job post not found" });
    res.status(200).json(jobPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a job post
export const updateJobPost = async (req, res) => {
  const { postId } = req.params;
  const updatedData = req.body;

  try {
    const job = await JobPost.findOneAndUpdate({ postId }, updatedData, {
      new: true,
    });

    if (!job) return res.status(404).json({ message: "Job post not found" });
    res.status(200).json({ message: "Job post updated successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update status of a job post
export const updateJobPostStatus = async (req, res) => {
  const { postId } = req.params; // Lấy postId từ URL
  const { status } = req.body; // Lấy trạng thái mới từ body yêu cầu

  try {
    // Kiểm tra trạng thái hợp lệ
    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Tìm và cập nhật bài đăng công việc theo postId và cập nhật trạng thái
    const job = await JobPost.findOneAndUpdate(
      { postId: postId },
      { status: status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res
      .status(200)
      .json({ message: "Job post status updated successfully", job });
  } catch (error) {
    console.error("Error updating job post status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a job post
export const deleteJobPost = async (req, res) => {
  try {
    const deletedJobPost = await JobPost.findByIdAndDelete(req.params.id);
    if (!deletedJobPost)
      return res.status(404).json({ message: "Job post not found" });
    res.status(200).json({ message: "Job post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API lấy số lượng bài đăng tuyển dụng
export const getJobPostCount = async (req, res) => {
  try {
    const { category } = req.query; // Lấy query params từ URL
    const query = category ? { category } : {};
    const count = await JobPost.countDocuments(query); // Đếm số bài đăng theo query
    console.log("Post count:", count); // Log số bài đăng
    res.status(200).json({
      message: "Count retrieved successfully.",
      count: count,
    });
  } catch (error) {
    console.error("Error retrieving post count:", error);
    res.status(500).json({
      message: "Failed to retrieve post count.",
      error: error.message,
    });
  }
};

// Freelancer nhận việc
// export const claimJobPost = async (req, res) => {
//   try {
//     const { assignedFreelancer } = req.body;

//     // Kiểm tra xem freelancer đã nhận việc hay chưa
//     if (!assignedFreelancer) {
//       return res.status(400).json({ message: "Freelancer ID is required." });
//     }

//     // Kiểm tra nếu assignedFreelancer là một ObjectId hợp lệ
//     if (!mongoose.Types.ObjectId.isValid(assignedFreelancer)) {
//       return res.status(400).json({ message: "Invalid Freelancer ID." });
//     }

//     const jobPost = await JobPost.findOneAndUpdate(
//       { postId: req.params.postId },
//       {
//         assignedFreelancer: assignedFreelancer,
//         recruitmentStatus: "In Progress",
//       },
//       { new: true }
//     );

//     if (!jobPost) {
//       return res.status(404).json({ message: "Job post not found" });
//     }

//     return res.status(200).json({
//       message: "Job successfully claimed.",
//       jobPost,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

//Apply công việc
export const applyForJob = async (req, res) => {
  const { postId } = req.params; // ID bài đăng
  const { freelancerId } = req.body; // ID freelancer

  try {
    const jobPost = await JobPost.findOne({ postId });
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    // Kiểm tra xem freelancer đã apply chưa
    if (jobPost.interestedFreelancers.includes(freelancerId)) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    // Thêm freelancer vào danh sách
    jobPost.interestedFreelancers.push(freelancerId);
    await jobPost.save();

    res.status(200).json({ message: "Applied successfully", jobPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nhận freelancer
export const acceptFreelancer = async (req, res) => {
  const { postId } = req.params; // ID bài đăng
  const { freelancerId } = req.body; // Freelancer được chọn

  try {
    const jobPost = await JobPost.findOne({ postId });
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    // Kiểm tra freelancer có trong danh sách quan tâm không
    if (!jobPost.interestedFreelancers.includes(freelancerId)) {
      return res
        .status(400)
        .json({ message: "Freelancer not found in interested list" });
    }

    // Gán freelancer được chọn
    jobPost.assignedFreelancer = freelancerId;
    // Xóa freelancer khỏi danh sách quan tâm
    jobPost.interestedFreelancers = jobPost.interestedFreelancers.filter(
      (id) => id.toString() !== freelancerId
    );
    // Chuyển trạng thái bài đăng
    jobPost.recruitmentStatus = "In Progress";

    await jobPost.save();

    res.status(200).json({
      message: "Freelancer accepted successfully",
      jobPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách freelancer quan tâm
export const getInterestedFreelancers = async (req, res) => {
  const { postId } = req.params; // ID bài đăng

  try {
    const jobPost = await JobPost.findOne({ postId }).populate(
      "interestedFreelancers",
      "username email avatar"
    );
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({
      message: "Interested freelancers retrieved successfully",
      interestedFreelancers: jobPost.interestedFreelancers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
