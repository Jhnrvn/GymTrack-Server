const male_profile = "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760111855/male-profile_y0lfy1.png";
const female_profile = "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760111856/female-profile-2_hh6ten.png";

const assignProfilePicture = async (req, res, next) => {
  const { gender } = req.body;
  try {
    if (!gender) {
      return res.status(400).json({
        header: "Bad Request",
        message: "Gender is required",
        success: false,
      });
    }

    req.body.profile_picture = gender === "Male" ? male_profile : female_profile;
    next();
  } catch (error) {
    res.status(401).json({
      header: "Authentication Failed",
      message: error.message,
      success: false,
    });
  }
};

export default assignProfilePicture;
