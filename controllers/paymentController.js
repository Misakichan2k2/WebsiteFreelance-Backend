import Payment from "../models/Payment.js";

// Tạo Payment mới
export const createPayment = async (req, res) => {
  try {
    const { postId } = req.body;

    // Kiểm tra nếu postId có tồn tại
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Job post detail is required",
      });
    }

    // Tính toán invoiceId
    const paymentsCount = await Payment.countDocuments(); // Đếm số lượng payment hiện tại
    const newInvoiceId = `INV${String(paymentsCount + 1).padStart(3, "0")}`; // Tạo invoiceId theo định dạng INV001, INV002...

    // Kiểm tra nếu có tệp được tải lên và gán đường dẫn hình ảnh
    const image = req.file ? "postImages/" + req.file.filename : null;

    // Tạo mới payment
    const newPayment = new Payment({
      ...req.body,
      postId: postId, // Gán postId từ req.body
      invoiceId: newInvoiceId,
      imagePath: image,
    });

    // Lưu payment vào cơ sở dữ liệu
    await newPayment.save();

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: newPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// Lấy tất cả payment
export const getAllPayments = async (req, res) => {
  try {
    // Lấy tất cả payment từ cơ sở dữ liệu
    const payments = await Payment.find().populate({
      path: "postId",
      select: "title category budget postBy assignedFreelancer", // Trường bạn muốn lấy trong postId
      populate: [
        {
          path: "postBy", // Populate trường postBy (nếu postBy là một ref)
          select: "username email role status userId", // Chọn các trường trong postBy mà bạn muốn lấy
        },
        {
          path: "assignedFreelancer",
          select: "username email role status userId", // Chọn các trường trong assignedFreelancer mà bạn muốn lấy
        },
      ],
    });

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No payments found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Lấy danh sách payment theo trạng thái
export const getPaymentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    // Kiểm tra nếu status không tồn tại
    if (!status) {
      console.log("No status query provided");
      return res.status(400).json({
        success: false,
        message: "Status query parameter is required",
      });
    }

    // Thực hiện truy vấn dựa trên status
    let payments;
    if (status === "Pending") {
      payments = await Payment.find({ status: "Pending" }).populate({
        path: "postId",
        select: "title category budget postBy assignedFreelancer", // Trường bạn muốn lấy trong postId
        populate: [
          {
            path: "postBy", // Populate trường postBy (nếu postBy là một ref)
            select: "username email role status userId", // Chọn các trường trong postBy mà bạn muốn lấy
          },
          {
            path: "assignedFreelancer",
            select: "username email role status userId", // Chọn các trường trong assignedFreelancer mà bạn muốn lấy
          },
        ],
      });
    } else if (status === "history") {
      payments = await Payment.find({ status: { $ne: "Pending" } }).populate({
        path: "postId",
        select: "title category budget postBy assignedFreelancer", // Trường bạn muốn lấy trong postId
        populate: [
          {
            path: "postBy", // Populate trường postBy (nếu postBy là một ref)
            select: "username email role status userId", // Chọn các trường trong postBy mà bạn muốn lấy
          },
          {
            path: "assignedFreelancer",
            select: "username email role status userId", // Chọn các trường trong assignedFreelancer mà bạn muốn lấy
          },
        ],
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'Pending' or 'history'.",
      });
    }

    console.log(
      `Payments found with status ${status}:`,
      JSON.stringify(payments, null, 2)
    );

    // Kiểm tra nếu payments không phải là mảng
    if (!Array.isArray(payments)) {
      console.log("Payments is not an array:", payments);
      return res.status(500).json({
        success: false,
        message: "Error: Result is not an array",
      });
    }

    // Kiểm tra nếu không có payment nào được tìm thấy
    if (payments.length === 0) {
      console.log(`No payments found with status: ${status}`);
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payments by status fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Lấy chi tiết payment theo invoiceId
export const getPaymentDetails = async (req, res) => {
  try {
    console.log(req.query);
    const { invoiceId } = req.params;

    // Tìm payment theo invoiceId
    const payment = await Payment.findOne({ invoiceId }).populate({
      path: "postId",
      select: "title category budget postBy assignedFreelancer", // Trường bạn muốn lấy trong postId
      populate: [
        {
          path: "postBy", // Populate trường postBy (nếu postBy là một ref)
          select: "username email role status userId", // Chọn các trường trong postBy mà bạn muốn lấy
        },
        {
          path: "assignedFreelancer",
          select: "username email role status userId", // Chọn các trường trong assignedFreelancer mà bạn muốn lấy
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment details fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment details",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái payment
export const updatePaymentStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ["Pending", "Paid", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid statuses are: Pending, Paid, Rejected.",
      });
    }

    // Cập nhật payment theo invoiceId
    const payment = await Payment.findOneAndUpdate(
      { invoiceId },
      { status },
      { new: true } // Trả về document sau khi cập nhật
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
};

// Lấy số lượng payment với trạng thái Pending
export const getPendingPaymentsCount = async (req, res) => {
  try {
    console.log("getPendingPaymentsCount function called");

    // Đếm số lượng payment với trạng thái Pending
    const pendingCount = await Payment.countDocuments({ status: "Pending" });
    console.log("Number of pending payments:", pendingCount);

    res.status(200).json({
      success: true,
      message: "Number of pending payments fetched successfully",
      data: pendingCount,
    });
  } catch (error) {
    console.error("Error fetching number of pending payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching number of pending payments",
      error: error.message,
    });
  }
};

// Đếm số lượng payment với trạng thái history
export const getHistoryPaymentsCount = async (req, res) => {
  try {
    const count = await Payment.countDocuments({ status: { $ne: "Pending" } });

    res.status(200).json({
      success: true,
      message: "Number of history payments fetched successfully",
      data: count,
    });
  } catch (error) {
    console.error("Error fetching number of history payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching number of history payments",
      error: error.message,
    });
  }
};
