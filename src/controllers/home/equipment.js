import Equipment from "../../models/Equipment.js";
import Log from "../../models/Log.js";

const getAllEquipment = async (req, res) => {
  const { search = "" } = req.query;

  const query = search
    ? {
        $or: [
          { equipment_name: { $regex: search, $options: "i" } },
          {
            equipment_description: { $regex: search, $options: "i" },
          },
        ],
      }
    : {};

  try {
    const equipment = await Equipment.find(query);
    return res.status(200).json({ success: true, equipment });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const addEquipment = async (req, res) => {
  const { equipment_name, equipment_description, equipment_type, equipment_condition, image_url } = req.body;

  try {
    const equipment = new Equipment({
      equipment_name,
      equipment_description,
      equipment_type,
      equipment_condition,
      equipment_image: image_url,
    });

   const newEquipment = await equipment.save();

    // create log
    const log = new Log({
      action: "ADD",
      user: req.user.id,
      message: `Equipment ${equipment.equipment_name} has been added`,
      status: true,
    });

    await log.save();
    return res.status(201).json({ header: "Success", success: true, message: "Equipment added successfully" });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const updateEquipment = async (req, res) => {
  const { _id, equipment_name, equipment_description, equipment_type, equipment_condition, image_file } = req.body;
  const { role } = req.user;

  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    const equipment = await Equipment.findById(_id);
    if (!equipment) {
      return res.status(404).json({ header: "Error", message: "Equipment not found", success: false });
    }
    if (image_file) {
      equipment.equipment_image = image_file;
    }
    equipment.equipment_name = equipment_name;
    equipment.equipment_description = equipment_description;
    equipment.equipment_type = equipment_type;
    equipment.equipment_condition = equipment_condition;

    await equipment.save();

    // create log
    const log = new Log({
      action: "UPDATE",
      user: req.user.id,
      message: `Equipment ${equipment.equipment_name} has been updated`,
      status: true,
    });

    await log.save();
    res.status(200).json({ header: "Success", success: true, message: "Equipment updated successfully" });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const deleteEquipment = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    const equipment = await Equipment.findByIdAndDelete(id);
    if (!equipment) {
      return res.status(404).json({ header: "Error", message: "Equipment not found", success: false });
    }

    // create log
    const log = new Log({
      action: "DELETE",
      user: req.user.id,
      message: `Equipment ${equipment.equipment_name} has been deleted`,
      status: true,
    });

    await log.save();
    res.status(200).json({ header: "Success", success: true, message: "Equipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

export { getAllEquipment, addEquipment, updateEquipment, deleteEquipment };
