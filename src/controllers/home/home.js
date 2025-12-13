import nodemailer from "nodemailer";
import "dotenv/config";
// utils
import { partialHiddenEmail } from "../../utils/hideEmail.utils.js";

// models
import Admin from "../../models/Admin.js";
import Log from "../../models/Log.js";

// admin home controller
const home = async (req, res) => {
  try {
    // find admin and checks if it exists
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      const error = new Error("Admin not found");
      error.status = 404;
      throw error;
    }

    // construct admin object contains the necessary info
    const adminInfo = {
      id: admin.id.toString(),
      email: partialHiddenEmail(admin.email),
      name: admin.name,
      role: admin.role,
      profile_picture: admin.profile_picture,
      updatedAt: admin.updatedAt,
      isFirstLogin: admin.isFirstLogin,
      last_update: admin.last_update || null,
      isEnrolled: admin.isEnrolled,
      enrolledAt: admin.enrolledAt,
    };

    res.status(200).json({ message: "Welcome!", user: adminInfo });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, header: "Server Error", message: error.message });
  }
};

const updateUserAvatar = async (req, res) => {
  const { avatar } = req.body;
  const { id } = req.user;
  try {
    const user = await Admin.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    user.profile_picture = avatar;

    await user.save();

    res.json({ header: "Success", message: "Profile image updated", success: true });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, header: "Server Error", message: error.message });
  }
};

// admin update info controller
const updateInfo = async (req, res) => {
  const { id } = req.user;
  const { firstName, lastName, email } = req.body;

  try {
    // find admin and checks if it exists
    const admin = await Admin.findById(id);
    if (!admin) {
      const error = new Error("Admin not found");
      error.status = 404;
      throw error;
    }

    // update first name, last name, and email
    admin.name.firstName = firstName;
    admin.name.lastName = lastName;
    admin.email = email;

    // update last updated date
    admin.last_update = Date.now();

    // save the document and return a success message
    await admin.save();
    res.json({ header: "Success", message: "Admin info updated", success: true });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, header: "Server Error", message: error.message });
  }
};

// admin change password controller
const changePassword = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.app_email,
        pass: process.env.app_password,
      },
    });

    const message = {
      from: process.env.app_email,
      to: "johnirvingeanga@gmail.com",
      subject: "Message title",
      text: "Plaintext version of the message",
      html: "<p>HELLO</p>",
    };

    const info = await transporter.sendMail(message);

    res.json({ message: "Password changed", success: true, info: info.response });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// admin logout controller
// todo: remove this controller and clean up the api call to the client side
const logout = async (req, res) => {
  const { id } = req.user;

  const user = await Admin.findById(id);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  try {
    // create new log and save
    const log = new Log({
      action: "LOGOUT",
      user: id,
      message: "User logged out",
      status: true,
    });

    user.active = false;

    await user.save();
    await log.save();

    res.status(200).json({ message: "Logout successful", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export { home, updateUserAvatar, updateInfo, changePassword, logout };
