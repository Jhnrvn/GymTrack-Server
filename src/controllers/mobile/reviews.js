import Review from "../../models/Review.js";
import Member from "../../models/Member.js";
import Log from "../../models/Log.js";

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("member", "firstName lastName member_type profile_picture")
      .sort({ createdAt: -1 });

    const totalReviews = await Review.countDocuments();
    const approvedReviews = await Review.countDocuments({ approved: true });
    const pendingReviews = await Review.countDocuments({ approved: false });

    res.status(200).json({
      header: "Success",
      message: "Reviews found",
      success: true,
      total: totalReviews,
      approved: approvedReviews,
      pending: pendingReviews,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const getMemberReview = async (req, res) => {
  const { member_id } = req.params;
  try {
    const member = await Member.findById({ _id: member_id });
    if (!member) {
      return res.status(404).json({ header: "Error", message: "Member not found", success: false });
    }

    const review = await Review.findOne({ member: member_id });

    res.status(200).json({ header: "Success", message: "Review found", success: true, data: review });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const addReview = async (req, res) => {
  const { member_id, rating, title, comment } = req.body;

  try {
    const member = await Member.findById(member_id);
    if (!member) {
      return res.status(404).json({ header: "Error", message: "Member not found", success: false });
    }

    const review = new Review({
      member: member_id,
      title: title || "Member Review",
      rating,
      comment,
    });

    await review.save();

    res.status(200).json({ header: "Success", message: "Review added", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const approveReview = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  try {
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    const review = await Review.findByIdAndUpdate(id, { approved: true });

    // create log
    const log = new Log({
      action: "APPROVE",
      member: review.member,
      user: req.user.id,
      message: "Review approved",
      status: true,
    });
    await log.save();

    res.status(200).json({ header: "Success", message: "Review approved", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const removeReview = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;
  try {
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    const review = await Review.findByIdAndUpdate(id, { approved: false });

    // create log
    const log = new Log({
      action: "REMOVE",
      member: review.member,
      user: req.user.id,
      message: "Review removed",
      status: true,
    });
    await log.save();

    res.status(200).json({ header: "Success", message: "Review removed", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  try {
    const review = await Review.findByIdAndDelete(id);

    if (role === "Admin" || role === "Staff") {
      // create log
      const log = new Log({
        action: "DELETE",
        user: req.user.id,
        member: review.member,
        message: "Review deleted",
        status: true,
      });
      await log.save();
    }
    res.status(200).json({ header: "Success", message: "Review deleted", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

export { getAllReviews, getMemberReview, addReview, approveReview, removeReview, deleteReview };
