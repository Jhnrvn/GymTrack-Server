import Notification from "../../models/Notification.js";

const getAllNotification = async (req, res) => {
  const { member_id } = req.params;

  try {
    const notifications = await Notification.find({
      user: member_id,
      $or: [
        { role_target: { $exists: false } }, // role_target not present
        { role_target: { $size: 0 } }, // or empty array []
      ],
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      user: member_id,
      isRead: false,
      $or: [
        { role_target: { $exists: false } }, // role_target not present
        { role_target: { $size: 0 } }, // or empty array []
      ],
    });

    res.status(200).json({ notifications, unread: unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const readNotification = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;

    await notification.save();
    res.status(200).json({ message: "Notification marked as read", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error, success: false });
  }
};

const deleteNotification = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  
  try {
    await Notification.deleteOne({ _id: id });
    res.status(200).json({ message: "Notification deleted", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error, success: false });
  }
};

export { getAllNotification, readNotification, deleteNotification };
