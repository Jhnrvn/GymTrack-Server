// models
import IncidentReport from "../../models/IncidentReport.js";
import Log from "../../models/Log.js";

const getIncidentReport = async (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const query = search
    ? {
        $or: [
          { reporter_name: { $regex: search, $options: "i" } }, // case-insensitive
          { member_name: { $regex: search, $options: "i" } },
          { witness_name: { $regex: search, $options: "i" } },
          { incident_description: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  try {
    const incidentReports = await IncidentReport.find({ ...query, isDeleted: false })
      .skip((pageNum - 1) * limitNum) // skip previous records
      .limit(limitNum); // limit per page;

    const [total, pending, resolved] = await Promise.all([
      IncidentReport.countDocuments({ isDeleted: false }),
      IncidentReport.countDocuments({ status: false, isDeleted: false }),
      IncidentReport.countDocuments({ status: true, isDeleted: false }),
    ]);

    res
      .status(200)
      .json({ total, pending, resolved, page: pageNum, pages: Math.ceil(total / limitNum), data: incidentReports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createIncidentReport = async (req, res) => {
  const { id, name, role } = req.user;

  const {
    incident_date,
    incident_time,
    location,
    incident_type,
    severity_level,
    incident_description,
    member_name,
    member_contact,
    witness_name,
    witness_contact,
    medical_attention,
    emergency_services,
    equipment_involved,
    injury_details,
    action_taken,
    report_agreement,
  } = req.body;
  try {
    if (role !== "Admin" && role !== "Staff") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    const newIncidentReport = new IncidentReport({
      userId: id,
      reporter_name: name.firstName + " " + name.lastName,
      reporter_role: role,
      incident_date: new Date(incident_date + "T" + incident_time),
      location,
      incident_type,
      severity_level,
      incident_description,
      member_name,
      member_contact,
      witness_name,
      witness_contact,
      medical_attention,
      emergency_services,
      equipment_involved,
      injury_details,
      action_taken,
      report_agreement,
    });

    await newIncidentReport.save();

    const log = new Log({
      action: "REPORT",
      user: req.user.id,
      message: incident_type,
      status: true,
    });
    await log.save();

    res.status(201).json({
      header: "Success",
      message: "Incident report created successfully.",
      success: true,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      header: "Something went wrong",
      message: error.message || "Something went wrong. Please try again later.",
      success: false,
    });
  }
};

const resolvedIncidentReport = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  try {
    if (role !== "Admin" && role !== "Staff") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    const incidentReport = await IncidentReport.findById(id);

    if (!incidentReport) {
      return res.status(404).json({
        header: "Oops",
        message: "Incident report not found.",
        success: false,
      });
    }

    incidentReport.status = true;
    incidentReport.resolved_date = Date.now();

    await incidentReport.save();

    const log = new Log({
      action: "RESOLVE",
      user: req.user.id,
      message: incidentReport.incident_type,
      status: true,
    });
    await log.save();

    res.status(200).json({
      header: "Success",
      message: "Incident report resolved successfully.",
      success: true,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      header: "Something went wrong",
      message: error.message || "Something went wrong. Please try again later.",
      success: false,
    });
  }
};

const deleteIncidentReport = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;
  try {
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    const incidentReport = await IncidentReport.findById(id);
    if (!incidentReport) {
      return res.status(404).json({
        header: "Oops",
        message: "Incident report not found.",
        success: false,
      });
    }

    incidentReport.isDeleted = true;
    await incidentReport.save();

    const log = new Log({
      action: "DELETE",
      action: "DELETE",
      user: req.user.id,
      message: incidentReport.incident_type,
      status: true,
    });
    await log.save();

    res.status(200).json({
      header: "Success",
      message: "Incident report deleted successfully.",
      success: true,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      header: "Something went wrong",
      message: error.message || "Something went wrong. Please try again later.",
      success: false,
    });
  }
};

export { getIncidentReport, createIncidentReport, resolvedIncidentReport, deleteIncidentReport };
