const nameFormatter = (input) => {
  if (!input || !input.trim()) return "";

  // Collapse multiple spaces and split into words
  const words = input.trim().replace(/\s+/g, " ").split(" ");

  return words
    .map((w) =>
      w
        .toLowerCase()
        // Capitalize first letter and any letter after -, ' or ’
        .replace(/(^|[-'’])[a-z]/g, (match) => match.toUpperCase())
    )
    .join(" ");
};

const formatName = async (req, res, next) => {
  const { firstName, lastName } = req.body;

  try {
    if (!firstName || !lastName) {
      return res.status(400).json({
        header: "Bad Request",
        message: "First name and last name are required",
        success: false,
      });
    }

    req.body.firstName = nameFormatter(firstName);
    req.body.lastName = nameFormatter(lastName);

    next();
  } catch (error) {
    res.status(500).json({
      header: "Internal Server Error",
      message: error.message,
      success: false,
    });
  }
};

// Utility function
const planNameFormatter = (input) => {
  if (!input || !input.trim()) return "";

  return (
    input
      // Trim and collapse extra spaces
      .trim()
      .replace(/\s+/g, " ")
      // Remove unwanted characters except letters, numbers, spaces, hyphens
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      // Convert to uppercase
      .toUpperCase()
  );
};

// Middleware function
const formatPlanName = async (req, res, next) => {
  const { plan_name } = req.body;

  try {
    if (!plan_name || !plan_name.trim()) {
      return res.status(400).json({
        header: "Bad Request",
        message: "Plan name is required",
        success: false,
      });
    }

    // Apply formatter
    req.body.plan_name = planNameFormatter(plan_name);

    next();
  } catch (error) {
    res.status(500).json({
      header: "Internal Server Error",
      message: error.message,
      success: false,
    });
  }
};

export { formatName, formatPlanName };
