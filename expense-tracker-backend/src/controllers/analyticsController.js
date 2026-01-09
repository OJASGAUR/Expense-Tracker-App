const prisma = require("../prisma");

// Expense overview (category-wise)
exports.expenseByCategory = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: "Invalid month" });
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ error: "Invalid year" });
    }

    const start = new Date(yearNum, monthNum - 1, 1);
    const end = new Date(yearNum, monthNum, 1);

    const data = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: req.userId,
        type: "expense",
        isDeleted: false,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        amount: true,
      },
    });

    res.json(data);
  } catch (error) {
    console.error("Expense by category error:", error);
    res.status(500).json({ error: "Failed to fetch expense data" });
  }
};

// Income overview (category-wise)
exports.incomeByCategory = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: "Invalid month" });
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ error: "Invalid year" });
    }

    const start = new Date(yearNum, monthNum - 1, 1);
    const end = new Date(yearNum, monthNum, 1);

    const data = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: req.userId,
        type: "income",
        isDeleted: false,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        amount: true,
      },
    });

    res.json(data);
  } catch (error) {
    console.error("Income by category error:", error);
    res.status(500).json({ error: "Failed to fetch income data" });
  }
};

// Account analysis (income vs expense)
exports.accountAnalysis = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: "Invalid month" });
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ error: "Invalid year" });
    }

    const start = new Date(yearNum, monthNum - 1, 1);
    const end = new Date(yearNum, monthNum, 1);

    const data = await prisma.transaction.groupBy({
      by: ["accountId", "type"],
      where: {
        userId: req.userId,
        isDeleted: false,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        amount: true,
      },
    });

    res.json(data);
  } catch (error) {
    console.error("Account analysis error:", error);
    res.status(500).json({ error: "Failed to fetch account analysis" });
  }
};
