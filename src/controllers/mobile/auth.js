import bcrypt from "bcrypt";
import "dotenv/config";
const secretKey = process.env.SECRET_KEY;
import jwt from "jsonwebtoken";

// models
import Member from "../../models/Member.js";

// send email
import sendCodeToChangePassword from "../../utils/sendCodeToChangePassword.js";

/**
 * member sign up controller
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {object}
 */
const signUp = async (req, res) => {
  const { email, password, firstName, lastName, isAgreed } = req.body;
  const salt = 13;

  try {
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(401).json({
        header: "Oops",
        message:
          "We have an account with that email address. Is that you? Contact the admin to guide you through the verification process",
        success: false,
        toConfirm: true,
      });
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const newMember = new Member({
      email,
      isAgreed,
      password: hashedPassword,
      gender: "Male",
      firstName,
      lastName,
      profile_picture: "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760111855/male-profile_y0lfy1.png",
    });

    await newMember.save();
    res.status(201).json({ header: "Success", message: "Account created", success: true, toConfirm: false });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false, toConfirm: false });
  }
};

/**
 * member sign in controller
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {object}
 */
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await Member.findOne({ email });

    // checks if member exist
    if (!member) {
      return res
        .status(401)
        .json({ header: "Oops", message: "Invalid email or password", success: false, toConfirm: false });
    }

    if (member && member.password === undefined) {
      return res.status(401).json({
        header: "Oops",
        message: "We have an account with that email address. Is that you?",
        success: false,
        toConfirm: true,
      });
    }

    // checks if password is correct
    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ header: "Oops", message: "Invalid email or password", success: false, toConfirm: false });
    }

    // create token
    // todo: add expiration in prod
    const token = jwt.sign({ id: member._id }, secretKey);

    res.status(200).json({ header: "Success", message: "Login successful", success: true, token });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false, toConfirm: false });
  }
};

const updatePassword = async (req, res) => {
  const { id } = req.user;
  const { current_password, new_password } = req.body;
  const salt = 13;

  try {
    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({ header: "Error", message: "Member not found", success: false });
    }

    // checks if new password is the same as the current password
    if (current_password === new_password) {
      return res.status(401).json({
        header: "Oops",
        message: "New password is the same as the current password",
        success: false,
        toConfirm: false,
      });
    }

    // checks if password is correct
    const isMatch = await bcrypt.compare(current_password, member.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ header: "Oops", message: "Invalid current password", success: false, toConfirm: false });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // update password
    member.password = hashedPassword;
    await member.save();

    res.status(200).json({ header: "Success", message: "Password changed", success: true, toConfirm: false });

    member.password = hashedPassword;
    await member.save();
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false, toConfirm: false });
  }
};

const forgotPasswordMobile = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await Member.findOne({ email });
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
    res.status(500).json({ header: "Error", message: error.message, success: false, toConfirm: false });
  }
};

const resetPasswordMobile = async (req, res) => {
  const { email, code, password } = req.body;
  const salt = 13;

  try {
    const user = await Member.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    if (user.changePassword_code !== code) {
      const error = new Error("Invalid code");
      error.header = "Invalid Code";
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.changePassword_code = null;
    await user.save();
    res.status(200).json({
      success: true,
      header: "Password Changed",
      message: "Your password has been changed successfully.",
    });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false, toConfirm: false });
  }
};

export { signUp, signIn, updatePassword, forgotPasswordMobile, resetPasswordMobile };
