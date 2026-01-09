const prisma = require("../prisma");
const crypto = require("crypto");
// Create income / expense / transfer
exports.createTransaction = async (req, res) => {
  const {
    amount,
    type, // income | expense | transfer
    note,
    accountId,
    categoryId,
    toAccountId, // only for transfer
  } = req.body;

  try {
    // Basic validation
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!type || (type !== 'income' && type !== 'expense' && type !== 'transfer')) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    if (type !== 'transfer' && !accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    if (type === 'transfer' && (!accountId || !toAccountId)) {
      return res.status(400).json({ error: 'Both accountId and toAccountId are required for transfers' });
    }

    if (type === 'transfer' && accountId === toAccountId) {
      return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }

    if (type !== 'transfer' && categoryId === undefined) {
      // categoryId is optional, but if explicitly sent as undefined, reject
      return res.status(400).json({ error: 'categoryId invalid' });
    }

    // Validate account ownership for income/expense
    if (type !== 'transfer' && accountId) {
      const account = await prisma.account.findFirst({
        where: { id: accountId, userId: req.userId, isDeleted: false },
      });
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
    }

    // Validate category ownership for income/expense
    if (type !== 'transfer' && categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: req.userId, isDeleted: false },
      });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      // Validate category type matches transaction type
      if (category.type !== type) {
        return res.status(400).json({ error: `Category type must be ${type}` });
      }
    }

    // Normal income / expense
    if (type !== "transfer") {
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          type,
          note: note || null,
          userId: req.userId,
          accountId,
          categoryId: categoryId || null,
        },
      });

      return res.status(201).json(transaction);
    }

    // Transfer logic - validate both accounts
    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findFirst({
        where: { id: accountId, userId: req.userId, isDeleted: false },
      }),
      prisma.account.findFirst({
        where: { id: toAccountId, userId: req.userId, isDeleted: false },
      }),
    ]);

    if (!fromAccount) {
      return res.status(404).json({ error: 'Source account not found' });
    }
    if (!toAccount) {
      return res.status(404).json({ error: 'Destination account not found' });
    }

    const transferGroupId = crypto.randomUUID();

    const fromTransaction = prisma.transaction.create({
      data: {
        amount,
        type: "transfer",
        note: note || null,
        transferGroupId,
        userId: req.userId,
        accountId,
      },
    });

    const toTransaction = prisma.transaction.create({
      data: {
        amount,
        type: "transfer",
        note: note || null,
        transferGroupId,
        userId: req.userId,
        accountId: toAccountId,
      },
    });

    await prisma.$transaction([fromTransaction, toTransaction]);

    res.status(201).json({ message: "Transfer successful" });
  } catch (error) {
    console.error('createTransaction error:', error);
    // If it's a Prisma known error, surface some info for debugging
    if (error.code && error.meta) {
      return res.status(500).json({ error: error.message, meta: error.meta });
    }

    res.status(500).json({ error: 'Transaction failed', message: error.message });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// Soft delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists and belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.userId,
        isDeleted: false,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await prisma.transaction.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};
