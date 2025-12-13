import jwt from "jsonwebtoken";
import "dotenv/config";
const secret = process.env.SECRET_KEY;

const authentication = async (req, res, next) => {
  // const token = req.cookies.a15fg_token;
  const auth_header = req.headers.authorization;
  const auth_token = auth_header && auth_header.split(" ")[1];

  try {
    // check if token exist
    if (!auth_token) {
      res.status(401).json({
        header: "Unauthorized Access",
        message: "You need to login first",
        success: false,
      });
      return;
    }

    // check if token is valid
    const decoded = jwt.verify(auth_token, secret);

    // assign the decoded user to the request and call the next middleware
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      header: "Authentication Failed",
      message: error.message,
      success: false,
    });
  }
};

export default authentication;
