const prisma = require("../prisma");

exports.createAccount = async (req, res) => {
  try {
    const { name, icon } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Account name is required" });
    }

    const account = await prisma.account.create({
      data: {
        name: name.trim(),
        icon: icon || null,
        userId: req.userId,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.userId,
        isDeleted: false,
      },
    });

    // Get all transactions for balance calculation
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        isDeleted: false,
      },
      select: {
        id: true,
        accountId: true,
        type: true,
        amount: true,
        transferGroupId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group transfers by transferGroupId to determine direction
    const transferGroups = {};
    allTransactions.forEach((t) => {
      if (t.transferGroupId) {
        if (!transferGroups[t.transferGroupId]) {
          transferGroups[t.transferGroupId] = [];
        }
        transferGroups[t.transferGroupId].push(t);
      }
    });

    // Calculate balance for each account
    const accountsWithBalance = accounts.map((account) => {
      let balance = 0;
      
      // Process all transactions for this account
      allTransactions.forEach((transaction) => {
        if (transaction.accountId === account.id) {
          if (transaction.type === "income") {
            balance += transaction.amount;
          } else if (transaction.type === "expense") {
            balance -= transaction.amount;
          } else if (transaction.type === "transfer" && transaction.transferGroupId) {
            // For transfers, find the other transaction in the group to determine direction
            const group = transferGroups[transaction.transferGroupId];
            if (group && group.length === 2) {
              // Sort by createdAt to determine source (first) and destination (second)
              const sortedGroup = [...group].sort((a, b) => 
                new Date(a.createdAt) - new Date(b.createdAt)
              );
              // The first transaction in the sorted group is the source (money going out)
              // The second is the destination (money coming in)
              const isSource = sortedGroup[0].id === transaction.id;
              if (isSource) {
                balance -= transaction.amount; // Money going out
              } else {
                balance += transaction.amount; // Money coming in
              }
            }
          }
        }
      });

      return {
        id: account.id,
        name: account.name,
        icon: account.icon,
        balance: Math.round(balance * 100) / 100, // Round to 2 decimal places
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      };
    });

    res.json(accountsWithBalance);
  } catch (error) {
    console.error("Get accounts error:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: req.userId,
        isDeleted: false,
      },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    await prisma.account.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: "Account deleted" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
};
