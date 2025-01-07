import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema(
  {
    postBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với model User
      required: true,
    },
    postId: {
      type: String,
      unique: true,
      required: true,
    },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    budget: { type: Number, required: true },
    deadline: { type: Date },
    engRequired: { type: Boolean, default: false },
    category: { type: String, required: true },
    sampleWork: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Approved", "Rejected", "Pending"],
      default: "Pending",
    },
    interestedFreelancers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        required: false,
      },
    ],
    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: false,
    },
    recruitmentStatus: {
      type: String,
      enum: ["Recruiting", "In Progress", "Completed", "Cancelled", "Deleted"],
      default: "Recruiting",
    },
  },
  { timestamps: true }
);

const JobPost = mongoose.model("JobPost", jobPostSchema);
export default JobPost;

// import mongoose from "mongoose";

// const jobPostSchema = new mongoose.Schema(
//   {
//     // Người đăng bài viết
//     postBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Liên kết với model User
//       required: true,
//     },

//     // ID bài đăng (mã duy nhất)
//     postId: {
//       type: String,
//       unique: true,
//       required: true,
//     },

//     // Tiêu đề bài đăng
//     title: {
//       type: String,
//       required: true,
//       trim: true, // Xóa khoảng trắng thừa
//     },

//     // Chi tiết bài đăng
//     detail: {
//       type: String,
//       required: true,
//     },

//     // Ngân sách dự án
//     budget: {
//       type: Number,
//       required: true,
//       min: 0, // Ngân sách phải lớn hơn hoặc bằng 0
//     },

//     // Hạn chót
//     deadline: {
//       type: Date,
//       validate: {
//         validator: (value) => value > Date.now(),
//         message: "Deadline must be in the future",
//       },
//     },

//     // Yêu cầu kỹ năng tiếng Anh
//     engRequired: {
//       type: Boolean,
//       default: false,
//     },

//     // Danh mục bài đăng
//     category: {
//       type: String,
//       required: true,
//       enum: ["IT", "Design", "Writing", "Marketing"], // Giới hạn các danh mục
//     },

//     // Mẫu công việc (nếu có)
//     sampleWork: {
//       type: String,
//       validate: {
//         validator: (value) => /\.(jpg|jpeg|png|pdf)$/i.test(value),
//         message: "Sample work must be a valid file format (jpg, jpeg, png, pdf)",
//       },
//     },

//     // Đường dẫn ảnh (nếu có)
//     imagePath: {
//       type: String,
//       default: "",
//       validate: {
//         validator: (value) => /\.(jpg|jpeg|png)$/i.test(value),
//         message: "Image must be a valid file format (jpg, jpeg, png)",
//       },
//     },

//     // Trạng thái bài đăng
//     status: {
//       type: String,
//       enum: ["Approved", "Rejected", "Pending"],
//       default: "Pending",
//     },
//   },
//   {
//     timestamps: true, // Tự động thêm createdAt và updatedAt
//   }
// );

// const JobPost = mongoose.model("JobPost", jobPostSchema);
// export default JobPost;
