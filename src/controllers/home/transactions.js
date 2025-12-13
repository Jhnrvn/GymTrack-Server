import Transaction from "../../models/Transaction.js";
import Member from "../../models/Member.js";
import MembershipPlan from "../../models/MembershipPlan.js";
import Product from "../../models/Product.js";
import Log from "../../models/Log.js";
import Notification from "../../models/Notification.js";

const getMemberTransactions = async (req, res) => {
  try {
    const { memberId } = req.params;

    const transactions = await Transaction.find({ member: memberId })
      .populate("member", "firstName lastName email")
      .populate("membership_plan", "plan_name plan_duration plan_price")
      .populate("product", "product_name product_price")
      .populate("handled_by", "name.firstName name.lastName role")
      .sort({ createdAt: -1 }); // sort by createdAt in descending order

    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const cancelMembershipTransaction = async (req, res) => {
  const { transaction_id } = req.body;
  const { id, role } = req.user;

  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    // find and delete transaction
    const transaction = await Transaction.findOneAndDelete({ _id: transaction_id });
    if (!transaction) {
      return res.status(404).json({ header: "Error", message: "Transaction not found", success: false });
    }

    // find member and set currentPlan to null
    const member = await Member.findById(transaction.member);
    if (!member) {
      return res.status(404).json({ header: "Error", message: "Member not found", success: false });
    }
    member.currentPlan = null;

    const log = new Log({
      action: "DELETE",
      membership: transaction.membership_plan,
      member: transaction.member,
      user: id,
      amount: transaction.total_amount,
      message: "Membership cancelled",
      status: false,
    });

    const notification = new Notification({
      user: transaction.member,
      title: "Membership Cancelled",
      message: "Your membership has been cancelled. Please renew your membership to continue using our services.",
      type: "Membership",
      status: true,
    });

    await member.save();
    await log.save();
    await notification.save();

    res.status(200).json({ header: "Success", message: "Membership cancelled", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const cancelProductTransaction = async (req, res) => {
  const { transaction_id } = req.body;
  const { id, role } = req.user;

  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    // find and delete transaction
    const transaction = await Transaction.findOneAndDelete({ _id: transaction_id });
    if (!transaction) {
      return res.status(404).json({ header: "Error", message: "Transaction not found", success: false });
    }

    const product = await Product.findById(transaction.product._id);

    product.product_stocks += transaction.product_quantity;
    await product.save();

    const log = new Log({
      action: "DELETE",
      product: transaction.product._id,
      member: transaction.member,
      user: id,
      amount: transaction.total_amount,
      message: "cancelled buying product",
      status: false,
    });

    const notification = new Notification({
      user: transaction.member,
      title: "Product Cancelled",
      message: "Buying product has been cancelled. Thank you for using our services.",
      type: "Product",
      status: true,
    });

    await log.save();
    await notification.save();

    res.status(200).json({ header: "Success", message: "Buying product cancelled", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

export { getMemberTransactions, cancelMembershipTransaction, cancelProductTransaction };
