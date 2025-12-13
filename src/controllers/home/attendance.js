import Attendance from "../../models/Attendance.js";

const deleteAttendance = async (req, res) => {
  const { id } = req.body;
  try {
    await Attendance.findByIdAndDelete(id);
    res.status(200).json({ header: "Success", message: "Attendance deleted", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

export { deleteAttendance };
