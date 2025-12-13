import crypto from "crypto";
import Member from "../models/Member.js";

// function that generate name using crypto library
const generateTempCode = (length) => {
  return {
    code: crypto.randomBytes(length).toString("hex"),
  };
};

const generateCode = async (req, res, next) => {
  const { code } = generateTempCode(3);

  try {
    req.body = { ...req.body, code };
    next();
  } catch (error) {
    res.status(500).json({
      header: "Internal Server Error",
      message: error.message,
      success: false,
    });
  }
};

export default generateCode;
