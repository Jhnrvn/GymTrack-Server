import Log from "../../models/Log.js";

// function to get all logs
const getAllLogs = async (req, res) => {
  const { date, id } = req.query;

  try {
    let query = {};

    // If date is provided, use it; otherwise default to today
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    query.createdAt = { $gte: start, $lte: end };

    // If id is provided, filter logs by user id
    if (id) {
      query.user = id; // assumes `id` is user ObjectId
    }

    // Fetch logs with populate and sort descending
    const logs = await Log.find(query)
      .populate("member", "firstName lastName email currentPlan")
      .populate("user", "name.firstName name.lastName role")
      .populate("membership", "plan_name")
      .populate("product", "product_name product_price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

export { getAllLogs };
