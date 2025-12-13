import Member from "../models/Member.js";
import bcrypt from "bcrypt";
import "dotenv/config";
const secretKey = process.env.SECRET_KEY;
import crypto from "crypto";

// function that generate name using crypto library
const generatePassword = (length) => {
  return {
    password: crypto.randomBytes(length).toString("hex"),
  };
};

const generatePasswordUpdateMemberInfo = async (req, res, next) => {
  const { id } = req.body;
  const { password } = generatePassword(4);
  const salt = 13;
  try {
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ header: "Error", message: "Member not found", success: false });
    }

    if (member.email) {
      return next();
    }

    // hash generated password
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body = { ...req.body, password, hashedPassword };
    return next();
  } catch (error) {
    res.status(500).json({
      header: "Internal Server Error",
      message: error.message,
      success: false,
    });
  }
};

export default generatePasswordUpdateMemberInfo;
