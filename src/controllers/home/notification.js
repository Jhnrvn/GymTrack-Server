import Notification from "../../models/Notification.js";
import Admin from "../../models/Admin.js";

const getAllAdminNotifications = async (req, res) => {
  const { role, id: userId } = req.user;
  try {
    const notifications = await Notification.find({ role_target: role }).sort({ createdAt: -1 });

    const unreadNotifications = notifications.map((n) => ({
      ...n._doc,
      isRead: n.readBy.includes(userId),
    }));

    res.status(200).json(unreadNotifications);
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: true,
    });
  }
};

const readAdminNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.user.id;

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { getAllAdminNotifications, readAdminNotification };
