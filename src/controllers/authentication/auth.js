import bcrypt from "bcrypt";
import crypto from "crypto";
import { google } from "googleapis";
import "dotenv/config";
const secretKey = process.env.SECRET_KEY;
import jwt from "jsonwebtoken";
// utils
import { partialHiddenEmail } from "../../utils/hideEmail.utils.js";

// send email
import sendVerificationEmail from "../../utils/sendVerification.utils.js";
import sendCodeToChangePassword from "../../utils/sendCodeToChangePassword.middleware.js";

// models
import Admin from "../../models/Admin.js";
import UserBiometric from "../../models/UserBiometric.js";
import Log from "../../models/Log.js";

// google
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const oAuth = async (req, res) => {
  const scopes = ["https://mail.google.com/"];
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  res.redirect(url);
};

const callback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided.");

  try {
    const { tokens } = await oAuth2Client.getToken(code);

    // Print the refresh token in browser
    res.send(`
      <h2>OAuth2 setup complete!</h2>
      <p>Copy the refresh token below and add it to your Render Environment Variables as <strong>REFRESH_TOKEN</strong>:</p>
      <pre>${tokens.refresh_token}</pre>
      <p>After that, you can safely remove this route for security.</p>
    `);

    console.log("Refresh Token:", tokens.refresh_token);
  } catch (err) {
    console.error("Error retrieving tokens:", err);
    res.status(500).send("Error retrieving tokens.");
  }
};

// register controller
const register = async (req, res) => {
  const { email, password, isAgree, name } = req.body;
  const salt = 13;

  try {
    // check if user already exist
    const userExist = await Admin.findOne({ email });
    if (userExist) {
      res.status(409).json({
        header: "User Already Exists",
        message: "An account with this email already exists. Please try logging in instead.",
        success: false,
      });
      return;
    }

    // hash user password
    const hashPassword = await bcrypt.hash(password, salt);
    // create token for account verification
    const token = crypto.randomBytes(64).toString("hex");

    // create new user
    const newAdmin = new Admin({
      email,
      name,
      profile_picture: "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760027120/profile_1_i3g7a5.png",
      password: hashPassword,
      isAgree,
      verification_token: token,
    });

    // send verification email using nodemailer
    const info = await sendVerificationEmail(email, token);

    // save user
    await newAdmin.save();
    res.status(201).json({
      header: "Registration Successful",
      message: "We sent you an email to verify your account.",
      success: true,
      info: info.response,
    });
  } catch (error) {
    res.status(500).json({
      header: "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
      success: false,
    });
  }
};

// get all fingerprints
const getFingerprints = async (req, res) => {
  try {
    const templates = await UserBiometric.find().lean();

    // convert the key form user_id to member_id
    const newTemplates = templates.map((template) => {
      let templateObj = template;

      templateObj["member_id"] = templateObj["user_id"];
      delete templateObj["user_id"];

      return (templateObj = {
        _id: template._id,
        member_id: template.member_id,
        ...templateObj,
      });
    });

    res.status(200).json({ success: true, templates: newTemplates });
  } catch (error) {
    res.status(500).json({
      header: "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
      success: false,
    });
  }
};

// verify account controller
const verifyAccount = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await Admin.findOne({ verification_token: token });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    user.isVerified = true;
    user.verification_token = null;

    await user.save();
    res.send("Account verified. You can now log in.");
  } catch (error) {
    res.status(error.status || 500).json({
      header: "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
      success: false,
    });
  }
};

// login controller
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if user exist
    const user = await Admin.findOne({ email });
    if (!user) {
      const error = new Error("The email or password you entered is incorrect.");
      error.header = "Invalid Credentials";
      error.status = 401;
      throw error;
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("The email or password you entered is incorrect.");
      error.header = "Invalid Credentials";
      error.status = 401;
      throw error;
    }

    if (user.isBlocked) {
      const error = new Error("Your account is blocked. Please contact the admin.");
      error.header = "Account Blocked";
      error.status = 401;
      throw error;
    }

    // check if user is verified
    if (!user.isVerified) {
      const error = new Error("Your account is not verified. Check your email first to verify.");
      error.header = "Account Not Verified";
      error.status = 401;
      throw error;
    }

    // check if user is permitted
    if (!user.isPermitted) {
      const error = new Error("Your account is not permitted. Please contact the admin.");
      error.header = "Account Not Permitted";
      error.status = 401;
      throw error;
    }

    const validUser = {
      id: user.id.toString(),
      profile_picture: user.profile_picture,
      email: partialHiddenEmail(user.email),
      name: user.name,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
    };

    const token = jwt.sign(validUser, secretKey, {
      expiresIn: "1d",
    });

    // create new log and save
    const log = new Log({
      action: "LOGIN",
      user: user.id.toString(),
      message: "User logged in",
      status: true,
    });

    user.active = true;

    // save log and users
    await log.save();
    await user.save();

    res.status(200).json({
      success: true,
      header: "Login Successful",
      message: "You have logged in successfully.",
      token,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      header: error.header || "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
    });
  }
};

// login using fingerprint
const loginFingerprint = async (req, res) => {
  const { id } = req.body;

  try {
    // check if user exist
    const user = await Admin.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    // user information payload
    const validUser = {
      id: user.id.toString(),
      profile_picture: user.profile_picture,
      email: partialHiddenEmail(user.email),
      name: user.name,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
    };

    // create token
    const token = jwt.sign(validUser, secretKey, {
      expiresIn: "1d",
    });

    // create new log and save
    const log = new Log({
      action: "LOGIN",
      user: user.id.toString(),
      message: "User logged in",
      status: true,
    });

    // save log and users
    await log.save();

    // return a response contains the token
    res.status(200).json({
      success: true,
      header: "Login Successful",
      message: "You have logged in successfully.",
      token,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      header: error.header || "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
    });
  }
};

const saveFingerprint = async (req, res) => {
  const { id, fingerprint } = req.body;

  try {
    const user = await Admin.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    user.enrolledAt = Date.now();
    user.isEnrolled = true;
    const fingerprintTemplate = new UserBiometric({ user_id: id, template: fingerprint });
    await fingerprintTemplate.save();
    await user.save();

    res.status(200).json({
      success: true,
      header: "Fingerprint Enrolled",
      message: "Fingerprint enrolled successfully.",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      header: error.header || "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
    });
  }
};

const deleteFingerprint = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await Admin.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    if (!user.isEnrolled) {
      const error = new Error("Fingerprint not found");
      error.status = 404;
      throw error;
    }

    await UserBiometric.deleteMany({ user_id: id });
    user.isEnrolled = false;
    user.enrolledAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      header: "Fingerprint Deleted",
      message: "Fingerprint deleted successfully.",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      header: error.header || "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
    });
  }
};

// change password
const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  const { id } = req.user;

  try {
    const user = await Admin.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      const error = new Error("The current password you entered is incorrect.");
      error.header = "Invalid Current Password";
      error.status = 401;

      throw error;
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(new_password, 13);
    user.password = hashedPassword;
    await user.save();

    // create new log
    const log = new Log({
      action: "UPDATE",
      user: id,
      message: "User changed password successfully.",
      status: true,
    });

    await log.save();

    res.status(200).json({
      success: true,
      header: "Password Changed",
      message: "Your password has been changed successfully.",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      header: error.header || "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    user.changePassword_code = code;
    await user.save();

    // send email
    await sendCodeToChangePassword(email, code);

    res.status(200).json({
      success: true,
      header: "Email Sent",
      message: "We sent you an email contains your code to reset your password.",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      header: error.header || "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
    });
  }
};

const newPassword = async (req, res) => {
  const { email, code, password } = req.body;
  const salt = 13;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      const error = new Error("User not found");
      error.header = "User Not Found";
      error.status = 404;
      throw error;
    }

    if (admin.changePassword_code !== code) {
      const error = new Error("Invalid code");
      error.header = "Invalid Code";
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    admin.password = hashedPassword;
    admin.changePassword_code = null;

    await admin.save();

    res.status(200).json({
      success: true,
      header: "Password Changed",
      message: "Your password has been changed successfully.",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      header: error.header || "Server Error",
      message: error.message || "Something went wrong. Please try again later.",
    });
  }
};

export {
  oAuth,
  callback,
  register,
  getFingerprints,
  verifyAccount,
  login,
  loginFingerprint,
  saveFingerprint,
  deleteFingerprint,
  changePassword,
  forgotPassword,
  newPassword,
};
