import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import jobPostRoutes from "./routes/jobPostRoutes.js";
import freelancerRoutes from "./routes/freelancerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import freelancerProfile from "./routes/freelancerProfileRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
connectDB();

const app = express();
// Xác định __filename và __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({}));

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/jobposts", jobPostRoutes);
app.use("/api/freelancer", freelancerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/freelancerprofile", freelancerProfile);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
