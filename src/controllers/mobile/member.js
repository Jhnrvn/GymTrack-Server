import Member from "../../models/Member.js";

/**
 * get member info
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {*}
 */
const getMemberInfo = async (req, res) => {
  const { id } = req.user;

  try {
    const member = await Member.findById(id)
      .populate({
        path: "attendance",
        options: {
          sort: { time_in: -1 },
        },
      })
      .populate("currentPlan.plan")
      .lean();
    if (!member) {
      const error = new Error("Member not found");
      error.status = 404;
      throw error;
    }

    delete member.password;

    res.status(200).json({ header: "Success", message: "Member found", success: true, data: member });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const updateMemberInfo = async (req, res) => {
  const { id } = req.user;
  const { firstName, lastName, age, gender } = req.body;
  try {
    const member = await Member.find({ firstName: firstName, lastName: lastName })
      .where({ _id: { $ne: id } })
      .exec();

    if (member.length > 0) {
      return res.status(409).json({ header: "Error", message: "Member already exist", success: false });
    }

    await Member.findByIdAndUpdate(id, { firstName, lastName, age, gender });

    res.status(200).json({ header: "Success", message: "Member updated", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const updateMemberProfile = async (req, res) => {
  const { profile_picture } = req.body;
  const { id } = req.user;

  try {
    const member = await Member.findById(id);
    if (!member) {
      const error = new Error("Member not found");
      error.status = 404;
      throw error;
    }

    member.profile_picture = profile_picture;
    await member.save();

    res.status(200).json({ header: "Success", message: "Member updated", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

export { getMemberInfo, updateMemberInfo, updateMemberProfile };
