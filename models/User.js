import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNatc6qh0SxKwFHdLsGbUNquVZBqKwLsdZNA&s",
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["Customer", "Freelancer"],
      default: "Customer",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: false,
    },
    phoneNumber: {
      type: String,
      // validate: {
      //   validator: function (v) {
      //     return /^(03|05|07|08|09)\d{8}$/.test(v);
      //   },
      //   message: (props) =>
      //     `${props.value} is not a valid Vietnamese phone number!`,
      // },
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    imagePath: {
      type: String,
      required: false,
    },
    // createdDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
