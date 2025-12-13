import Admin from "../../models/Admin.js";
// utils
import { partialHiddenEmail } from "../../utils/hideEmail.utils.js";

const getAllStaff = async (req, res) => {
  try {
    const staffs = await Admin.find({ role: "Staff", isBlocked: false }, { password: 0 }).lean();

    const hiddenEmailStaffs = staffs.map((staff) => {
      const hiddenEmail = partialHiddenEmail(staff.email);
      return { ...staff, email: hiddenEmail };
    });

    res.status(200).json(hiddenEmailStaffs);
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const getAllBlockedStaff = async (req, res) => {
  try {
    const staffs = await Admin.find({ role: "Staff", isBlocked: true }, { password: 0 }).lean();

    const hiddenEmailStaffs = staffs.map((staff) => {
      const hiddenEmail = partialHiddenEmail(staff.email);
      return { ...staff, email: hiddenEmail };
    });

    res.status(200).json(hiddenEmailStaffs);
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const grantPermission = async (req, res) => {
  const { id } = req.body;

  try {
    const user = await Admin.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    user.isPermitted = !user.isPermitted;
    await user.save();

    if (user.isPermitted) {
      res.status(200).json({ header: "Success", message: "Permission granted", success: true });
      return;
    }
    res.status(200).json({ header: "Success", message: "Permission revoked", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const blockUser = async (req, res) => {
  const { id } = req.body;

  try {
    const user = await Admin.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    user.isBlocked = true;
    await user.save();

    res.status(200).json({ header: "Success", message: "User blocked", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const unblockUser = async (req, res) => {
  const { id } = req.body;

  try {
    const user = await Admin.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({ header: "Success", message: "User unblocked", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

export { getAllStaff, getAllBlockedStaff, grantPermission, blockUser, unblockUser };
