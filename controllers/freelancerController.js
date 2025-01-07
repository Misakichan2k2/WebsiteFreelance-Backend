import Freelancer from "../models/Freelancer.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

export const createFreelancerPost = async (req, res) => {
  try {
    const count = await Freelancer.countDocuments(); // Đếm bài đăng
    const postId = `FP${(count + 1).toString().padStart(3, "0")}`;
    const image = req.file
      ? "postImages/" + req.file.filename
      : "postImages/freelancer.jpg";

    const newFreelancerPost = new Freelancer({
      ...req.body,
      postBy: req.body.postBy,
      postId: postId,
      imagePath: image,
    });

    const savedFreelancerPost = await newFreelancerPost.save();
    res.status(201).json(savedFreelancerPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all freelancer posts
export const getFreelancerPosts = async (req, res) => {
  try {
    const freelancerPosts = await Freelancer.find().populate(
      "postBy",
      "username email role status userId avatar"
    );
    res.status(200).json(freelancerPosts); // Trả về danh sách bài đăng
  } catch (error) {
    res.status(500).json({ message: error.message }); // Xử lý lỗi
  }
};

// Get job posts with status "Approved" (for users)
export const getApprovedFreelancerPosts = async (req, res) => {
  try {
    const freelancerPosts = await Freelancer.find({
      status: "Approved",
    }).populate("postBy", "userId username email role status avatar");
    res.status(200).json(freelancerPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single freelancer post by ID
export const getFreelancerPostById = async (req, res) => {
  try {
    const freelancerPost = await Freelancer.findById(req.params.id).populate(
      "postBy",
      "userId username email role status avatar"
    );
    if (!freelancerPost)
      return res.status(404).json({ message: "freelancer post not found" });
    res.status(200).json(freelancerPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a freelancer post
export const updateFreelancerPost = async (req, res) => {
  const { postId } = req.params;
  const updatedData = req.body;

  try {
    if (req.file) {
      const oldPost = await Freelancer.findOne({ postId }); // Corrected model reference
      if (oldPost && oldPost.imagePath) {
        const oldImagePath = path.resolve("uploads", oldPost.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updatedData.imagePath = "postImages/" + req.file.filename;
    }

    const freelancer = await Freelancer.findOneAndUpdate(
      { postId },
      updatedData,
      { new: true }
    );
    if (!freelancer) {
      return res.status(404).json({ message: "freelancer post not found" });
    }
    res
      .status(200)
      .json({ message: "freelancer post updated successfully", freelancer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update status of a freelancer post
export const updateFreelancerPostStatus = async (req, res) => {
  const { postId } = req.params;
  const { status } = req.body;

  try {
    if (!status || !["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }
    const freelancer = await Freelancer.findOneAndUpdate(
      { postId },
      { status },
      { new: true }
    );
    if (!freelancer) {
      return res.status(404).json({ message: "freelancer post not found" });
    }
    res.status(200).json({
      message: "freelancer post status updated successfully",
      freelancer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a freelancer post
export const deleteFreelancerPost = async (req, res) => {
  try {
    const deletedFreelancerPost = await Freelancer.findByIdAndDelete(
      req.params.id
    );
    if (!deletedFreelancerPost)
      return res.status(404).json({ message: "freelancer post not found" });

    if (deleteFreelancerPost.imagePath) {
      const imagePath = path.resolve("uploads", deleteFreelancerPost.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(200).json({ message: "freelancer post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get freelancer post count
export const getFreelancerPostCount = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const count = await Freelancer.countDocuments(query);
    res.status(200).json({ message: "Count retrieved successfully.", count });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve post count.",
      error: error.message,
    });
  }
};

// Get random 5 freelancer posts with status "Approved" excluding the current post
export const getRandomApprovedFreelancerPosts = async (req, res) => {
  const { excludeId } = req.query; // Lấy ID bài đăng cần loại bỏ

  console.log("excludeId:", excludeId); // In ra giá trị excludeId để debug

  try {
    // Kiểm tra nếu excludeId tồn tại và có dạng ObjectId hợp lệ
    if (!excludeId || !mongoose.Types.ObjectId.isValid(excludeId)) {
      return res.status(400).json({ message: "Invalid excludeId provided" });
    }

    // Sử dụng new mongoose.Types.ObjectId() để đảm bảo ObjectId được tạo đúng cách
    const excludeObjectId = new mongoose.Types.ObjectId(excludeId);

    // Sử dụng aggregate để lấy các bài đăng phê duyệt và loại trừ bài đăng hiện tại
    const randomPosts = await Freelancer.aggregate([
      {
        $match: {
          status: "Approved", // Lọc các bài đăng có status "Approved"
          _id: { $ne: excludeObjectId }, // Loại trừ bài đăng với ID là excludeId
        },
      },
      { $sample: { size: 5 } }, // Lấy 5 bài đăng ngẫu nhiên
    ]);

    // Trả về danh sách bài đăng ngẫu nhiên
    res.status(200).json(randomPosts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
