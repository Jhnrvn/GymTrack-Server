import mongoose from "mongoose";
import Member from "../../models/Member.js";
import Attendance from "../../models/Attendance.js";
import MembershipPlan from "../../models/MembershipPlan.js";
import Transaction from "../../models/Transaction.js";
import Notification from "../../models/Notification.js";
import Log from "../../models/Log.js";

// utils
import {
  biometricEnrollment,
  totalTrainers,
  totalMembers,
  countMale,
  countFemale,
  countDoneSession,
  countWorkingOut,
  countNotVisited,
} from "../../utils/attendance_utils.js";
import sendMemberAccountEmail from "../../utils/sendMemberAccount.js";

// function to get all gym members information
const getAllMembers = async (req, res) => {
  const { search = "", page = 1, limit = 5, status = "" } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const query = search
    ? {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: search,
                options: "i",
              },
            },
          },
        ],
      }
    : {};
  try {
    // --- Get today's range ---
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let memberIds = [];

    // --- Filter Logic ---
    if (status === "done session") {
      // Members who have both time_in and time_out today
      memberIds = await Attendance.find({
        time_in: { $gte: startOfDay, $lte: endOfDay },
        time_out: { $exists: true, $ne: null },
      }).distinct("member");
    } else if (status === "working out") {
      // Members who have time_in today but no time_out
      memberIds = await Attendance.find({
        time_in: { $gte: startOfDay, $lte: endOfDay },
        $or: [{ time_out: { $exists: false } }, { time_out: null }],
      }).distinct("member");
    } else if (status === "not visited") {
      // Members with no attendance record for today
      const attendedToday = await Attendance.find({
        time_in: { $gte: startOfDay, $lte: endOfDay },
      }).distinct("member");

      const attendedSet = new Set(attendedToday.map((id) => id.toString()));

      const allMembers = await Member.find().distinct("_id");
      memberIds = allMembers.filter((id) => !attendedSet.has(id.toString()));
    }

    // --- Apply status filter ---
    if (status && memberIds.length) {
      query._id = { $in: memberIds.map((id) => new mongoose.Types.ObjectId(id)) };
    } else if (status && memberIds.length === 0) {
      // No results for this status
      return res.json({ members: [], total: 0 });
    }

    // --- Final Member Query ---
    const members = await Member.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate({
        path: "currentPlan.plan",
        select: "plan_name plan_duration plan_price",
      })
      .populate({
        path: "attendance",
        options: { sort: { time_in: -1 }, limit: 10 },
      })
      .populate({
        path: "transactions",
        populate: [
          { path: "membership_plan", select: "plan_name plan_duration plan_price" },
          { path: "product", select: "product_name product_price" },
          { path: "handled_by", select: "name.firstName name.lastName role" },
        ],
        options: { sort: { createdAt: -1 } },
      })
      .sort({ firstName: 1 })
      .lean({ virtuals: true });

    const formatted = members.map(({ currentPlan, ...rest }) => ({
      ...rest,
      currentPlan,
    }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // --- Get total membership amount ---
    const result = await Transaction.aggregate([
      {
        $match: {
          type: "Membership",
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total_amount" },
        },
      },
    ]);

    const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

    formatted.forEach((member) => {
      if (member.attendance?.length) {
        member.attendance.sort((a, b) => b.time_in - a.time_in);
      }
    });

    const total = await Member.countDocuments(query);

    const membersList = await Member.find(query).populate({
      path: "attendance",
      options: { sort: { time_in: -1 } },
    });

    const { enrolled, notEnrolled } = biometricEnrollment(membersList);
    const totalTrainer = totalTrainers(membersList);
    const totalMember = totalMembers(membersList);
    const totalMale = countMale(membersList);
    const totalFemale = countFemale(membersList);
    const doneSession = countDoneSession(membersList);
    const workingOut = countWorkingOut(membersList);
    const notVisited = countNotVisited(membersList);

    res.status(200).json({
      member_type: { totalTrainer, totalMember },
      gender_count: { totalMale, totalFemale },
      biometric: { enrolled, notEnrolled },
      doneSession,
      workingOut,
      notVisited,
      totalAmount,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

const getTodaysAttendance = async (req, res) => {
  const { date } = req.query;
  try {
    // Get current date in local timezone (e.g., Asia/Manila)
    const now = date ? new Date(date) : new Date();

    // Compute start and end of the day in local time
    const startOfDayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Convert to UTC (Mongo stores in UTC)
    const startOfDayUTC = new Date(startOfDayLocal.toISOString());
    const endOfDayUTC = new Date(endOfDayLocal.toISOString());

    const todaysAttendance = await Attendance.find({
      time_in: { $gte: startOfDayUTC, $lte: endOfDayUTC },
    })
      .populate({
        path: "member",
        select: "firstName lastName member_type",
        populate: {
          path: "currentPlan.plan",
          select: "plan_name",
          model: "Plan",
        },
      })
      .populate()
      .sort({ time_in: -1 });

    res.status(200).json({
      header: "Success",
      message: "Today's attendance retrieved successfully.",
      success: true,
      data: todaysAttendance,
    });
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

const getMemberDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const member = await Member.findById(id).populate({
      path: "attendance",
      options: { sort: { time_in: -1 }, limit: 10 },
    });

    if (!member) {
      return res.status(404).json({
        header: "Error",
        message: "Member not found.",
        success: false,
      });
    }

    res.status(200).json({
      header: "Success",
      message: "Member info retrieved successfully.",
      success: true,
       member,
    });
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

// function that add new member
const addNewMember = async (req, res) => {
  const memberInfo = req.body;
  const { id } = req.user;

  try {
    memberInfo.firstName = memberInfo.firstName.trim();
    memberInfo.lastName = memberInfo.lastName.trim();

    // Check if member exists by firstName + lastName
    const memberExist = await Member.findOne({
      firstName: { $regex: new RegExp(`^${memberInfo.firstName}$`, "i") },
      lastName: { $regex: new RegExp(`^${memberInfo.lastName}$`, "i") },
    }).exec();

    if (memberExist) {
      const error = new Error("Member already exists");
      error.status = 409;
      throw error;
    }

    // If email provided, check uniqueness
    if (memberInfo.email) {
      const emailExist = await Member.findOne({ email: memberInfo.email.trim().toLowerCase() }).exec();
      if (emailExist) {
        const error = new Error("Email already used by another member");
        error.status = 409;
        throw error;
      }
    } else {
      delete memberInfo.email;
    }

    // Create new member
    const newMember = new Member({
      firstName: memberInfo.firstName,
      lastName: memberInfo.lastName,
      age: memberInfo.age,
      email: memberInfo.email,
      gender: memberInfo.gender,
      profile_picture: memberInfo.profile_picture,
      member_type: memberInfo.member_type,
      currentPlan: {
        plan: memberInfo.plan,
        price: memberInfo.price,
        discount_rate: memberInfo.discount_rate,
        startDate: new Date(),
        endDate: memberInfo.endDate,
      },
    });

    // If email exists, assign password and send email
    if (memberInfo.email) {
      newMember.password = memberInfo.hashedPassword;
      await sendMemberAccountEmail(memberInfo.email, memberInfo.password);
    }

    const member = await newMember.save();

    // Create activity log
    const log = new Log({
      action: "ADD",
      user: id,
      member: member._id,
      membership: memberInfo.plan,
      amount: memberInfo.price,
      message: "Added a new member",
      status: true,
    });

    // Create notification
    const notification = new Notification({
      user: member._id,
      type: "Membership",
      title: "Thank you for joining us",
      message: "Your membership has been successfully added",
      details: {
        plan: memberInfo.plan,
        price: memberInfo.price,
        discount_rate: memberInfo.discount_rate,
        startDate: new Date(),
        endDate: memberInfo.endDate,
      },
    });

    // Create transaction
    const transaction = new Transaction({
      member: member._id,
      type: "Membership",
      membership_plan: memberInfo.plan,
      startDate: new Date(),
      endDate: memberInfo.endDate,
      discount_rate: memberInfo.discount_rate,
      total_amount: memberInfo.price,
      transaction_method: "Cash",
      handled_by: id,
      status: "Paid",
    });

    await Promise.all([log.save(), notification.save(), transaction.save()]);

    // Link transaction to member
    member.currentPlan.transaction = transaction._id;
    await member.save();

    res.status(201).json({
      header: "Success",
      message: "New member successfully added",
      success: true,
    });
  } catch (error) {
    // Handle duplicate key error (MongoDB index violation)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const message = duplicateField === "email" ? "Email already used by another member" : "Member already exists";
      return res.status(409).json({
        header: "Error",
        message,
        success: false,
      });
    }

    // Log failed attempt
    const log = new Log({
      action: "ADD",
      user: id,
      message: "Adding member failed",
      status: false,
    });

    await log.save();

    res.status(error.status || 500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

// function for time in
const clockInAttendance = async (req, res) => {
  const { id: memberId } = req.body;
  const { id } = req.user;

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check if member exists
    const member = await Member.findById(memberId).exec();

    if (!member) {
      const error = new Error("Member not found");
      error.status = 404;
      throw error;
    }

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      member: memberId,
      time_in: { $gte: startOfDay, $lte: endOfDay },
    });

    // destructure firstName and lastName from member
    const { firstName, lastName } = member;
    if (existing) {
      const error = new Error(`${firstName} ${lastName} already clocked in today!`);
      error.status = 409;
      throw error;
    }

    const attendance = new Attendance({
      member: memberId,
      time_in: new Date(),
    });

    // log the time in success
    const log = new Log({
      action: "TIME IN",
      member: memberId,
      user: id,
      message: "Member time in",
      status: true,
    });

    // create notification
    const notification = new Notification({
      user: memberId,
      type: "Attendance",
      title: "Time In",
      message: "You have time in",
      details: {
        time_in: new Date(),
      },
    });

    await log.save();
    await notification.save();
    await attendance.save();

    res.status(201).json({
      header: "Success",
      message: `${firstName} ${lastName} time in successfully`,
      success: true,
    });
  } catch (error) {
    // log the time in success
    const log = new Log({
      action: "TIME IN",
      member: memberId,
      user: id,
      message: "User time in failed",
      status: false,
    });

    await log.save();

    res.status(error.status || 500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

// function for time out
const clockOutAttendance = async (req, res) => {
  const { id: memberId } = req.body;
  const { id } = req.user;

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const member = await Member.findById(memberId).exec();

    if (!member) {
      const error = new Error("Member not found");
      error.status = 404;
      throw error;
    }

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      member: memberId,
      time_out: { $gte: startOfDay, $lte: endOfDay },
    });

    // destructure firstName and lastName from member
    const { firstName, lastName } = member;
    if (existing) {
      const error = new Error(`${firstName} ${lastName} already clocked out today!`);
      error.status = 409;
      throw error;
    }

    const attendance = await Attendance.findOne({ member: memberId, time_in: { $gte: startOfDay, $lte: endOfDay } });

    if (!attendance) {
      const error = new Error("User not clocked in today!");
      error.status = 409;
      throw error;
    }

    attendance.time_out = new Date();

    // log the time out success
    const log = new Log({
      action: "TIME OUT",
      member: memberId,
      user: id,
      message: "User time out",
      status: true,
    });

    // create notification
    const notification = new Notification({
      user: memberId,
      type: "Attendance",
      title: "Time Out",
      message: "You have time out",
      details: {
        time_in: new Date(),
      },
    });

    await log.save();
    await notification.save();
    await attendance.save();

    res.status(200).json({
      header: "Success",
      message: `${firstName} ${lastName} time out successfully`,
      success: true,
    });
  } catch (error) {
    // log the time out failed
    const log = new Log({
      action: "TIME OUT",
      member: memberId,
      user: id,
      message: "User time out failed",
      status: false,
    });

    await log.save();

    res.status(error.status || 500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

// function that renew a membership plan when it expires
const renewMembershipPlan = async (req, res) => {
  const { id: memberId, plan, price, discount_rate, endDate } = req.body;
  const { id } = req.user;
  try {
    const member = await Member.findById(memberId);
    if (!member) {
      const error = new Error("Member not found");
      error.status = 404;
      throw error;
    }

    const currentPlan = member.currentPlan;

    if (member.currentPlan.plan) {
      member.planHistory.push(currentPlan);
    }

    // create transaction
    const transaction = new Transaction({
      member: memberId,
      type: "Membership",
      membership_plan: plan,
      startDate: new Date(),
      endDate,
      discount_rate: discount_rate,
      total_amount: price,
      transaction_method: "Cash",
      handled_by: id,
      status: "Paid",
    });

    const transact = await transaction.save();

    member.currentPlan = {
      transaction: transact._id,
      plan,
      price,
      discount_rate,
      startDate: new Date(),
      endDate,
    };

    // create log
    const log = new Log({
      action: "UPDATE",
      membership: plan,
      member: memberId,
      user: id,
      amount: price,
      message: "Plan renewed",
      status: true,
    });

    // create notification
    const notification = new Notification({
      user: memberId,
      type: "Membership",
      title: "Membership Plan Renewal",
      message: "Your membership plan has been successfully renewed",
      details: {
        plan,
        price,
        discount_rate,
        startDate: new Date(),
        endDate,
      },
    });

    await log.save();
    await notification.save();
    await member.save();

    res.json({
      header: "Success",
      message: "Membership successfully renewed",
      success: true,
    });
  } catch (error) {
    const log = new Log({
      action: "PLAN RENEWAL",
      membership: plan,
      member: memberId,
      user: id,
      message: "Membership plan renewal failed",
      status: false,
    });

    await log.save();

    res.status(error.status || 500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

const changeMembershipPlan = async (req, res) => {
  const { id: member_id, plan, price, discount_rate, endDate, transaction_id } = req.body;
  const { id, role } = req.user;
  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    // find the current plan transaction and delete
    const transaction = await Transaction.findOneAndDelete({ _id: transaction_id });
    if (!transaction) {
      const error = new Error("Transaction not found");
      error.status = 404;
      throw error;
    }

    // create log
    const changeLog = new Log({
      action: "DELETE",
      membership: plan,
      member: member_id,
      user: id,
      amount: transaction.total_amount,
      message: "Removed plan",
      status: false,
    });

    changeLog.save();

    // create new transaction
    const newTransaction = new Transaction({
      member: member_id,
      type: "Membership",
      membership_plan: plan,
      startDate: new Date(),
      endDate,
      discount_rate: discount_rate,
      total_amount: price,
      transaction_method: "Cash", // todo: update after implementing payment choice
      handled_by: id,
      status: "Paid",
    });

    const transact = await newTransaction.save();

    const member = await Member.findById(member_id);
    if (!member) {
      const error = new Error("Member not found");
      error.status = 404;
      throw error;
    }

    member.currentPlan = {
      transaction: transact._id,
      plan,
      price,
      discount_rate,
      startDate: new Date(),
      endDate,
    };

    // create log
    const log = new Log({
      action: "UPDATE",
      membership: plan,
      member: member_id,
      user: id,
      amount: price,
      message: "Changed plan",
      status: true,
    });

    // create notification
    const notification = new Notification({
      user: member_id,
      type: "Membership",
      title: "Membership Plan Change",
      message: "Your membership plan has been successfully changed",
      details: {
        plan,
        price,
        discount_rate,
        startDate: new Date(),
        endDate,
      },
    });

    await member.save();
    await log.save();
    await notification.save();

    res.json({
      header: "Success",
      message: "Membership successfully change",
      success: true,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

/**
 * update member details
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {*}
 */
const updateMemberDetails = async (req, res) => {
  const info = req.body;
  const { id: adminId, role } = req.user;

  try {
    // Check if the user is an admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    // Check for duplicate members (same first and last name but different ID)
    const duplicateMember = await Member.findOne({
      firstName: info.firstName,
      lastName: info.lastName,
      _id: { $ne: info.id },
    });

    if (duplicateMember) {
      const error = new Error("Member already exists");
      error.status = 409;
      throw error;
    }

    // Find the target member
    const member = await Member.findById(info.id);
    if (!member) {
      const error = new Error("Member not found");
      error.status = 404;
      throw error;
    }

    // Handle email updates
    if (member.email !== info.email) {
      const emailInUse = await Member.findOne({
        email: info.email,
        _id: { $ne: info.id },
      });

      if (emailInUse) {
        const error = new Error("Email already used by another member");
        error.status = 409;
        throw error;
      }

      const hadNoEmail = !member.email;
      member.email = info.email?.toLowerCase() || null;

      // Save first before sending email
      await member.save();

      if (hadNoEmail && info.email && info.password) {
        member.password = info.hashedPassword;
        await sendMemberAccountEmail(info.email, info.password);
      }
    }

    // Update other details
    member.firstName = info.firstName;
    member.lastName = info.lastName;
    member.age = info.age;
    member.gender = info.gender;
    member.member_type = info.member_type;

    // Save updated member details
    await member.save();

    // Log success
    await new Log({
      action: "UPDATE",
      user: adminId,
      member: member._id,
      message: "Update member details",
      status: true,
    }).save();

    // create notification for the member
    const notification = new Notification({
      user: member._id,
      type: "Notice",
      title: "Your details has been modified",
      message: "Your details has been modified. if you not aware of this, please contact us",
    });

    await notification.save();

    res.status(200).json({
      header: "Success",
      message: "Member updated successfully",
      success: true,
    });
  } catch (error) {
    // Log failure
    await new Log({
      action: "UPDATE",
      user: req.user.id,
      member: info.id,
      message: "Failed to update member details",
      status: false,
    }).save();

    res.status(error.status || 500).json({
      header: "Error",
      message: error.message || "An error occurred",
      success: false,
    });
  }
};

export {
  getAllMembers,
  getTodaysAttendance,
  getMemberDetails,
  addNewMember,
  clockInAttendance,
  clockOutAttendance,
  renewMembershipPlan,
  changeMembershipPlan,
  updateMemberDetails,
};
