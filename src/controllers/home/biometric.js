import Member from "../../models/Member.js";
import Biometric from "../../models/Biometric.js";
import Log from "../../models/Log.js";

// get all fingerprints
const getAllFingerprints = async (req, res) => {
  try {
    const templates = await Biometric.find();
    res.status(200).json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

// get fingerprint
const getFingerprint = async (req, res) => {
  const { id } = req.params;

  try {
    const fingerprint = await Biometric.findOne({ member_id: id });
    if (!fingerprint) {
      return res.status(404).json({ header: "Error", message: "Fingerprint not found", success: false });
    }

    res.status(200).json({ success: true, template: fingerprint.template });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

// enroll fingerprint
const enrollFingerprint = async (req, res) => {
  const { id, fingerprint } = req.body;

  try {
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ header: "Error", message: "Member not found", success: false });
    }

    member.isEnrolled = true;
    member.enrolledAt = new Date();

    await member.save();
    await Biometric.create({ member_id: id, template: fingerprint });

    // create log
    const log = new Log({
      action: "ADD",
      member: id,
      user: req.user.id,
      message: "Fingerprint enrolled",
      status: true,
    });

    await log.save();

    res.status(200).json({ header: "Success", message: "Fingerprint enrolled", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

// delete fingerprint
const deleteFingerprint = async (req, res) => {
  const { id } = req.body;
  try {
    // check if member exist
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ header: "Error", message: "Member not found", success: false });
    }

    // check if member is enrolled
    if (member.isEnrolled) {
      await Biometric.findOneAndDelete({ member_id: id });
      member.isEnrolled = false;
      member.enrolledAt = null;
    }

    await member.save();

    // create log
    const log = new Log({
      action: "DELETE",
      member: id,
      user: req.user.id,
      message: "Fingerprint deleted",
      status: true,
    });

    await log.save();

    res.status(200).json({ header: "Success", message: "Fingerprint deleted", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

export { getAllFingerprints, getFingerprint, enrollFingerprint, deleteFingerprint };
