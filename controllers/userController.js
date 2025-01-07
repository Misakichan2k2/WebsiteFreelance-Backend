import User from "../models/User.js";
import { errorHandler } from "../utils/errorHandler.js";
import path from "path";
import fs from "fs";

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    next(errorHandler(500, "Failed to fetch users."));
  }
};

// Get user by userId
export const getUserById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId }); // Find user by userId
    if (!user) {
      return next(errorHandler(404, "User not found."));
    }

    const userData = {
      id: user.userId, // Field from the schema
      email: user.email,
      username: user.username,
      dateOfBirth: user.dateOfBirth || null,
      gender: user.gender || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      role: user.role || "Customer", // Default to 'Customer' if undefined
      avatar: user.avatar || "",
      createdDate: user.createdDate,
      status: user.status || "Unverified", // Default 'Unverified' if missing
    };

    res.status(200).json(userData); // Return the user data
  } catch (error) {
    next(errorHandler(500, "Failed to fetch user details."));
  }
};

// export const getUser = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return next(errorHandler(404, "User not found!"));
//     }
//     const { password: pass, ...rest } = user._doc;
//     res.status(200).json(rest);
//   } catch (error) {
//     next(error);
//   }
// };

// Delete user
export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const deletedUser = await User.findOneAndDelete({ userId });
    if (!deletedUser) {
      return next(errorHandler(404, "User not found."));
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    next(errorHandler(500, "Failed to delete user."));
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const updatedData = req.body;

  try {
    const existingUser = await User.findOne({ userId });

    if (!existingUser) {
      return next(errorHandler(404, "User not found."));
    }

    // Nếu có file ảnh được upload
    if (req.file) {
      const avatarPath = `/uploads/postImages/${req.file.filename}`;

      // Nếu user đã có avatar cũ thì có thể xóa nếu cần (tùy chọn)
      // if (
      //   existingUser.avatar &&
      /* !existingUser.avatar.includes("encrypted-tbn0") */
      // ) {
      //   const oldPath = path.join(__dirname, "../..", existingUser.avatar);
      //   if (fs.existsSync(oldPath)) {
      //     fs.unlinkSync(oldPath);
      //   }
      // }

      // Gán avatar mới
      updatedData.avatar = avatarPath;
    }

    // Cập nhật các trường từ payload, bỏ qua trường undefined
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined) {
        existingUser[key] = updatedData[key];
      }
    });

    // Lưu dữ liệu đã cập nhật
    const savedUser = await existingUser.save();

    res.status(200).json({
      message: "User updated successfully.",
      user: savedUser,
    });
  } catch (error) {
    console.error(error); // Log lỗi để kiểm tra chi tiết
    next(errorHandler(500, "Failed to update user."));
  }
};

// export const updateUser = async (req, res, next) => {
//   if (req.user.id !== req.params.id)
//     return next(errorHandler(401, "you can only update own account!"));
//   try {
//     if (req.body.password) {
//       req.body.password = bcryptjs.hashSync(req.body.password, 10);
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           username: req.body.username,
//           email: req.body.email,
//           password: req.body.password,
//           avatar: req.body.avatar,
//           role: req.body.role,
//           gender: req.body.gender,
//           phoneNumber: req.body.phoneNumber,
//           address: req.body.address,
//           dateOfBirth: req.body.dateOfBirth,
//           status: req.body.status,
//         },
//       },
//       { new: true }
//     );
//     const { password, ...rest } = updatedUser._doc;

//     res.status(200).json(rest);
//   } catch (error) {
//     next(error);
//   }
// };

// API lấy số lượng tài khoản
export const getAccountCount = async (req, res) => {
  try {
    const count = await User.countDocuments(); // Đếm số tài khoản trong database
    res.json({ count });
  } catch (error) {
    console.error("Error fetching account count:", error);
    res.status(500).json({ message: "Error fetching account count" });
  }
};

// API lấy số lượng tài khoản với role là Freelancer
export const getFreelancerCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: "Freelancer" }); // Đếm số tài khoản có role là Freelancer
    res.json({ count });
  } catch (error) {
    console.error("Error fetching freelancer account count:", error);
    res
      .status(500)
      .json({ message: "Error fetching freelancer account count" });
  }
};
