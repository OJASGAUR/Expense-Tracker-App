const prisma = require("../prisma");

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, type } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }

    if (!type || (type !== "income" && type !== "expense")) {
      return res.status(400).json({ error: "Category type must be 'income' or 'expense'" });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        icon: icon || null,
        type,
        userId: req.userId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId: req.userId,
        isDeleted: false,
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.userId,
        isDeleted: false,
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    await prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};
