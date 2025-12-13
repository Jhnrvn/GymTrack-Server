import crypto from "crypto";
import Member from "../models/Member.js";

// function that generate name using crypto library
const generateFirstAndLastName = (length) => {
  return {
    firstName: "User",
    lastName: crypto.randomBytes(length).toString("hex"),
  };
};

const generateMemberName = async (req, res, next) => {
  const { firstName, lastName } = generateFirstAndLastName(4);

  try {
    // checks if the generated name has already been used
    const user = await Member.findOne({ lastName: lastName });
    if (user) {
      // if it has been used, generate a new name
      return generateName(req, res, next);
    }
    req.body = { ...req.body, firstName, lastName };
    next();
  } catch (error) {
    res.status(500).json({
      header: "Internal Server Error",
      message: error.message,
      success: false,
    });
  }
};

export default generateMemberName;
