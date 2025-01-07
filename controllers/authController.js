import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  // Check if the email already exists
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    console.log("Email already exists:", email); // Debug log
    return res.status(400).json({ message: "Email already exists!" });
  }

  // Check if the username already exists
  const existingUserByUsername = await User.findOne({ username });
  if (existingUserByUsername) {
    console.log("Username already exists:", username); // Debug log
    return res.status(400).json({ message: "Username already exists!" });
  }

  // Find the last user and generate the next userId
  const lastUser = await User.findOne().sort({ userId: -1 });
  let newUserId = "US001"; // Default userId if no users exist

  if (lastUser) {
    const lastUserId = lastUser.userId;
    const lastNumber = parseInt(lastUserId.substring(2)); // Extract the number part
    const newNumber = lastNumber + 1; // Increment by 1
    newUserId = `US${newNumber.toString().padStart(3, "0")}`; // Format to 3 digits
  }

  // Hash the password
  const hashedPassword = bcryptjs.hashSync(password, 10);

  // Create a new user with the required fields and auto-generated userId
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    userId: newUserId, // Assign generated userId
  });

  try {
    // Save the new user
    await newUser.save();
    res.status(201).json("User created successfully!");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      return next(errorHandler(404, "User not found!"));
    }

    const validPassword = bcryptjs.compareSync(password, existedUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Wrong credentials!"));
    }

    const token = jwt.sign({ id: existedUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = existedUser._doc;
    res.status(200).json({ ...rest, token });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      // Nếu người dùng chưa tồn tại, tạo người dùng mới
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("User has been logged out!");
  } catch (error) {
    next(error);
  }
};
