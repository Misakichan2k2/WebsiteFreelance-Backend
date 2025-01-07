import freelancerProfile from "../models/freelancerProfile.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Helper function to generate the next FRV code
const generateFRVCode = async () => {
  const session = await mongoose.startSession(); // Start a MongoDB session
  session.startTransaction(); // Start a transaction

  try {
    // Find the last profile sorted by createdAt
    const lastProfile = await freelancerProfile
      .findOne({}, {}, { session }) // Use session to ensure transaction safety
      .sort({ createdAt: -1 });

    // Generate the new FRV code
    let newFRV = "FRV001";
    if (lastProfile && lastProfile.FRV) {
      const lastCode = parseInt(lastProfile.FRV.replace("FRV", ""), 10);
      const nextCode = (lastCode + 1).toString().padStart(3, "0");
      newFRV = `FRV${nextCode}`;
    }

    await session.commitTransaction(); // Commit the transaction
    session.endSession(); // End the session
    return newFRV;
  } catch (error) {
    await session.abortTransaction(); // Rollback if there's an error
    session.endSession();
    throw new Error("Error generating FRV code");
  }
};

export const createFreelancerProfile = async (req, res) => {
  try {
    // Generate FRV code
    const FRV = await generateFRVCode();

    // Handle the uploaded image file
    const image = req.file ? `postImages/${req.file.filename}` : null;

    // Validate required fields
    const {
      userProfile,
      description,
      email,
      phoneNumber,
      bankAccountNumber,
      bankAccountName,
      fullName,
      idCardNumber,
    } = req.body;

    if (
      !userProfile ||
      !description ||
      !email ||
      !phoneNumber ||
      !bankAccountNumber ||
      !bankAccountName ||
      !fullName ||
      !idCardNumber
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create the freelancer profile
    const newProfile = new freelancerProfile({
      userProfile,
      description,
      FRV,
      email,
      phoneNumber,
      bankAccountNumber,
      bankAccountName,
      fullName,
      idCardNumber,
      imagePath: image,
    });

    // Save to the database
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Error creating profile:", error); // Log the error
    res.status(500).json({
      message: "Error creating profile",
      error: error.message || error,
    });
  }
};

// Get all freelancer profiles
export const getAllFreelancerProfiles = async (req, res) => {
  try {
    const profiles = await freelancerProfile
      .find()
      .populate("userProfile", "username role status userId avatar");
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profiles", error });
  }
};

// Get freelancer profile by ID
export const getFreelancerProfileById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy _id từ tham số URL
    const profile = await freelancerProfile
      .findById(id) // Tìm kiếm bằng _id
      .populate("userProfile", "username role status userId avatar");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

export const updateFreelancerStatus = async (req, res) => {
  try {
    const { FRV } = req.params; // Lấy mã FRV từ tham số URL
    const { status } = req.body;

    // Kiểm tra giá trị trạng thái hợp lệ
    if (!["Verified", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Tìm và cập nhật trạng thái của freelancer profile
    const updatedProfile = await freelancerProfile.findOneAndUpdate(
      { FRV }, // Tìm kiếm theo mã FRV
      { status },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Nếu trạng thái được cập nhật thành "Verified", thay đổi role trong User profile
    if (status === "Verified") {
      const updatedUser = await User.findByIdAndUpdate(
        updatedProfile.userProfile, // Tìm user profile thông qua userProfile ID trong freelancer profile
        { role: "Freelancer", status: "Verified" }, // Cập nhật role thành "Freelancer"
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating status:", error); // Log lỗi chi tiết vào console
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

// Count the total number of freelancer profiles
export const countFreelancerProfiles = async (req, res) => {
  try {
    const count = await freelancerProfile.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting profiles", error });
  }
};
