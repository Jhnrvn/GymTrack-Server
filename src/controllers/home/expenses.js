import Expense from "../../models/Expense.js";
import Log from "../../models/Log.js";

// Add a new expense
const addExpense = async (req, res) => {
  const { title, amount, date } = req.body;
  const { id, role } = req.user;

  try {
    // Check if the user is an admin
    if (role !== "Admin") {
      return res.status(403).json({
        header: "Forbidden",
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    // Validate required fields
    if (!title || !amount || !id) {
      return res.status(400).json({
        header: "Validation Error",
        message: "Title, amount, and handledBy are required",
        success: false,
      });
    }

    // Default date to today if not provided
    const expenseDate = date ? new Date(date) : new Date();

    const newExpense = new Expense({
      title,
      amount,
      handledBy: id,
      date: expenseDate,
    });

    await newExpense.save();

    // Create log
    const log = new Log({
      action: "EXPENSE",
      user: id,
      amount: amount,
      message: title,
      status: false,
    });

    await log.save();

    return res.status(201).json({
      header: "Success",
      message: "Expense added successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;
  try {
    // Check if the user is an admin
    if (role !== "Admin") {
      return res.status(403).json({
        header: "Forbidden",
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    // Validate required fields
    if (!id) {
      return res.status(400).json({ header: "Error", message: "Expense ID is required", success: false });
    }

    // Delete the expense
    const deleted = await Expense.findByIdAndDelete(id);

    // Check if the expense was deleted
    if (!deleted) {
      return res.status(404).json({ header: "Error", message: "Expense not found", success: false });
    }

    const log = new Log({
      action: "DELETE",
      user: req.user.id,
      amount: deleted.amount,
      message: deleted.title,
      status: true,
    });

    await log.save();

    return res.status(200).json({
      header: "Success",
      message: "Expense deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

export { addExpense, deleteExpense };
