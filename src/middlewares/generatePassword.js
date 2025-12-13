import bcrypt from "bcrypt";
import "dotenv/config";
const secretKey = process.env.SECRET_KEY;
import crypto from "crypto";

// function that generate name using crypto library
const generateMemberPassword = (length) => {
  return {
    password: crypto.randomBytes(length).toString("hex"),
  };
};

const generatePassword = async (req, res, next) => {
  const { password } = generateMemberPassword(4);
  const salt = 13;
  try {
    if (!req.body.email) {
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

export default generatePassword;
