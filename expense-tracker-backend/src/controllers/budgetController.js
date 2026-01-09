const prisma = require("../prisma");

exports.createBudget = async (req, res) => {
  try {
    const { amount, month, year, categoryId } = req.body;

    // Validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ error: "Month must be between 1 and 12" });
    }

    if (!year || year < 2000 || year > 2100) {
      return res.status(400).json({ error: "Invalid year" });
    }

    if (!categoryId) {
      return res.status(400).json({ error: "Category is required" });
    }

    // Validate category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: req.userId,
        isDeleted: false,
        type: 'expense', // Budgets are only for expense categories
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found or not an expense category" });
    }

    // Check if budget already exists for this category, month, and year
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: req.userId,
        categoryId,
        month: Number(month),
        year: Number(year),
        isDeleted: false,
      },
    });

    if (existingBudget) {
      return res.status(400).json({ error: "Budget already exists for this category, month, and year" });
    }

    const budget = await prisma.budget.create({
      data: {
        amount,
        month: Number(month),
        year: Number(year),
        categoryId,
        userId: req.userId,
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error("Create budget error:", error);
    res.status(500).json({ error: "Failed to create budget" });
  }
};

exports.getBudgets = async (req, res) => {
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

    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.userId,
        month: monthNum,
        year: yearNum,
        isDeleted: false,
      },
      include: {
        category: true,
      },
    });

    res.json(budgets);
  } catch (error) {
    console.error("Get budgets error:", error);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if budget exists and belongs to user
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.userId,
        isDeleted: false,
      },
    });

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    await prisma.budget.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: "Budget deleted" });
  } catch (error) {
    console.error("Delete budget error:", error);
    res.status(500).json({ error: "Failed to delete budget" });
  }
};
