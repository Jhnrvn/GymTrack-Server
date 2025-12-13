import Member from "../../models/Member.js";
import MembershipPlan from "../../models/MembershipPlan.js";
import Product from "../../models/Product.js";
import Transaction from "../../models/Transaction.js";
import Expense from "../../models/Expense.js";

const activePlans = async (req, res) => {
  const now = new Date();

  try {
    const activePlans = await Member.aggregate([
      {
        $match: {
          "currentPlan.plan": { $exists: true, $ne: null },
          "currentPlan.endDate": { $gte: now },
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "currentPlan.plan",
          foreignField: "_id",
          as: "plan_info",
        },
      },
      { $unwind: "$plan_info" },
      {
        $group: {
          _id: "$plan_info.plan_name",
          count: { $sum: 1 },
        },
      },
    ]);

    // Step 2: Get all available plans (to ensure missing ones get count = 0)
    const allPlans = await MembershipPlan.find({}, { plan_name: 1, _id: 0 }).lean();

    // Step 3: Merge counts (ensures zero-count for inactive plans)
    const planMap = new Map(activePlans.map((p) => [p._id, p.count]));
    const categories = allPlans.map((p) => p.plan_name);
    const counts = allPlans.map((p) => planMap.get(p.plan_name) || 0);

    // Step 4: Respond with structured data
    res.status(200).json({ categories, counts });
  } catch (err) {
    console.error("Error fetching active plans:", err);
    res.status(500).json({ header: "Error", message: err.message, success: false });
  }
};

const membershipTrend = async (req, res) => {
  const selectYear = new Date(req.query.year).getFullYear();

  try {
    const year = parseInt(selectYear) || new Date().getFullYear();

    const result = await Transaction.aggregate([
      // only membership type transactions
      {
        $match: {
          type: "Membership",
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00Z`),
          },
        },
      },

      // join with plans to know which are daily or not
      {
        $lookup: {
          from: "plans",
          localField: "membership_plan",
          foreignField: "_id",
          as: "plan_info",
        },
      },
      { $unwind: "$plan_info" },

      // extract month
      {
        $addFields: {
          month: { $month: "$createdAt" },
          planType: {
            $cond: [
              { $eq: ["$plan_info.plan_duration", "1_day"] }, // your daily plan name
              "Regular Patrons",
              "Patrons w/ Membership",
            ],
          },
        },
      },

      // group per month and planType
      {
        $group: {
          _id: { month: "$month", planType: "$planType" },
          count: { $sum: 1 },
        },
      },

      // reshape for easy mapping
      {
        $group: {
          _id: "$_id.month",
          counts: {
            $push: {
              k: "$_id.planType",
              v: "$count",
            },
          },
        },
      },

      // turn array of key-value pairs to object
      {
        $addFields: {
          countsObj: { $arrayToObject: "$counts" },
        },
      },

      // project only what we need
      {
        $project: {
          _id: 0,
          month: "$_id",
          regular: { $ifNull: ["$countsObj.Regular Patrons", 0] },
          membership: { $ifNull: ["$countsObj.Patrons w/ Membership", 0] },
        },
      },

      // sort by month
      { $sort: { month: 1 } },
    ]);

    // initialize missing months (1–12)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const found = result.find((r) => r.month === i + 1);
      return {
        month: i + 1,
        regular: found?.regular || 0,
        membership: found?.membership || 0,
      };
    });

    // format for ApexChart
    const response = {
      series: [
        {
          name: "Regular Patrons",
          type: "column",
          data: monthlyData.map((m) => m.regular),
        },
        {
          name: "Patrons w/ Membership",
          type: "line",
          data: monthlyData.map((m) => m.membership),
        },
      ],
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate membership trends" });
  }
};

const monthlyRevenue = async (req, res) => {
  const selectYear = new Date(req.query.year).getFullYear();

  try {
    const year = parseInt(selectYear) || new Date().getFullYear();

    // Aggregate Monthly Revenue
    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          status: "Paid",
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00Z`),
            $lte: new Date(`${year}-12-31T23:59:59Z`),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$total_amount" },
          memberships: {
            $sum: {
              $cond: [{ $eq: ["$type", "Membership"] }, "$total_amount", 0],
            },
          },
          products: {
            $sum: {
              $cond: [{ $eq: ["$type", "Product"] }, "$total_amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalRevenue: 1,
          memberships: 1,
          products: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // Aggregate Monthly Expenses
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00Z`),
            $lte: new Date(`${year}-12-31T23:59:59Z`),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalExpense: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalExpense: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // --- Combine Data ---
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const totalRevenueArr = Array(12).fill(0);
    const membershipsArr = Array(12).fill(0);
    const productsArr = Array(12).fill(0);
    const expensesArr = Array(12).fill(0);
    const netRevenueArr = Array(12).fill(0);

    // Fill revenue data
    monthlyRevenue.forEach(({ month, totalRevenue, memberships, products }) => {
      totalRevenueArr[month - 1] = totalRevenue;
      membershipsArr[month - 1] = memberships;
      productsArr[month - 1] = products;
    });

    // Fill expense data
    monthlyExpenses.forEach(({ month, totalExpense }) => {
      expensesArr[month - 1] = totalExpense;
    });

    // Compute net revenue per month
    for (let i = 0; i < 12; i++) {
      netRevenueArr[i] = totalRevenueArr[i] - expensesArr[i];
    }

    // Compute total yearly values
    const totalRevenueYear = totalRevenueArr.reduce((a, b) => a + b, 0);
    const totalExpenseYear = expensesArr.reduce((a, b) => a + b, 0);
    const totalNetRevenue = totalRevenueYear - totalExpenseYear;

    res.json({
      data: {
        year,
        months,
        total: totalRevenueArr,
        memberships: membershipsArr,
        products: productsArr,
        expenses: expensesArr,
        netRevenue: netRevenueArr,
        totals: {
          totalRevenueYear,
          totalExpenseYear,
          totalNetRevenue,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate monthly revenue data" });
  }
};

const productSales = async (req, res) => {
  try {
    // Get date from query (defaults to today)
    const dateQuery = req.query.date ? new Date(req.query.date) : new Date();

    const startOfDay = new Date(dateQuery.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateQuery.setHours(23, 59, 59, 999));

    const summary = await Transaction.aggregate([
      {
        $match: {
          type: "Product",
          status: "Paid",
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      // Join product collection to get product name
      {
        $lookup: {
          from: "products", // collection name in MongoDB
          localField: "product",
          foreignField: "_id",
          as: "product_info",
        },
      },
      {
        $unwind: "$product_info", // flatten product array
      },
      // Group to summarize total quantity and total amount
      {
        $group: {
          _id: "$product_info._id",
          productName: { $first: "$product_info.product_name" },
          totalSold: { $sum: "$product_quantity" },
          totalSales: { $sum: "$total_amount" },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          totalSold: 1,
          totalSales: 1,
        },
      },
      {
        $sort: { totalSales: -1 }, // optional: sort by highest sales
      },
    ]);

    // Overall summary totals
    const overall = summary.reduce(
      (acc, cur) => {
        acc.totalProductsSold += cur.totalSold;
        acc.totalSalesAmount += cur.totalSales;
        return acc;
      },
      { totalProductsSold: 0, totalSalesAmount: 0 }
    );

    res.status(200).json({
      date: req.query.date || new Date().toISOString().split("T")[0],
      totalProductsSold: overall.totalProductsSold,
      totalSalesAmount: overall.totalSalesAmount,
      products: summary,
    });
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const dailyRevenue = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));

    // Transactions summary
    const transactionsPipeline = [
      { $match: { createdAt: { $gte: start, $lte: end }, status: "Paid" } },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$total_amount" },
          count: { $sum: 1 },
        },
      },
    ];
    const transactionsSummary = await Transaction.aggregate(transactionsPipeline);
    const totalSales = transactionsSummary.reduce((acc, t) => acc + t.totalAmount, 0);

    // Membership details
    const membershipDetails = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: "Paid",
          type: "Membership",
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "membership_plan",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: "$plan" },
      {
        $group: {
          _id: "$plan.plan_name",
          totalAmount: { $sum: "$total_amount" },
          quantity: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Product details
    const productDetails = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: "Paid",
          type: "Product",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product_info",
        },
      },
      { $unwind: "$product_info" },
      {
        $group: {
          _id: "$product_info.product_name",
          totalAmount: { $sum: "$total_amount" },
          quantity: { $sum: "$product_quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Expenses
    const expensesPipeline = [
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$amount" },
          details: { $push: "$$ROOT" },
        },
      },
    ];
    const expenseSummaryArr = await Expense.aggregate(expensesPipeline);
    const totalExpense = expenseSummaryArr[0]?.totalExpense || 0;
    const expenseDetails = expenseSummaryArr[0]?.details || [];

    const netRevenue = totalSales - totalExpense;

    return res.status(200).json({
      success: true,
      data: {
        transactionsSummary,
        totalSales,
        totalExpense,
        netRevenue,
        memberships: membershipDetails,
        products: productDetails,
        expenseDetails,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { activePlans, membershipTrend, monthlyRevenue, productSales, dailyRevenue };
