const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        availableFunds: user.availableFunds,
        verificationStatus: user.verificationStatus,
        uid: user.uid,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );
    return res
      .status(200)
      .json({ message: "User logged in successfully", user, token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/users/details/:email", async (req, res) => {
  const { email } = req.params;

  console.log("email", email);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
    });

    console.log("user", user);
    console.log(trades);
    console.log(transactions);

    res.status(200).json({ user, trades, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/status", async (req, res) => {
  const { email, status } = req.body;

  console.log("email", email);
  console.log("status", status);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { status },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/pairs/control", async (req, res) => {
  const { id, isControlled, controlPercentage } = req.body;

  console.log("id", id);
  console.log("isControlled", isControlled);
  console.log("controlPercentage", controlPercentage);

  try {
    const pair = await prisma.pair.update({
      where: { id },
      data: { isControlled, controlPercentage },
    });

    if (!pair) {
      return res.status(404).json({ error: "Pair not found" });
    }

    console.log("Pair updated successfully", pair);

    res.status(200).json({ pair });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/pairs/add", async (req, res) => {
  const tradingPairs = [
    {
      symbol: "XAUUSD",
    },
    {
      symbol: "XAGUSD",
    },
    {
      symbol: "BTCUSD",
    },
    {
      symbol: "LTCUSD",
    },
    {
      symbol: "USOIL",
    },
    {
      symbol: "UKOIL",
    },
    {
      symbol: "ETHUSD",
    },
    {
      symbol: "USDJPY",
    },
    {
      symbol: "EURGBP",
    },
    {
      symbol: "NZDUSD",
    },
    {
      symbol: "GBPUSD",
    },
    {
      symbol: "USDCHF",
    },
    {
      symbol: "USDCAD",
    },
    {
      symbol: "EURJPY",
    },
    {
      symbol: "GBPNZD",
    },
    {
      symbol: "EURCAD",
    },
    {
      symbol: "GBPJPY",
    },
    {
      symbol: "EURAUD",
    },
    {
      symbol: "EURUSD",
    },
    {
      symbol: "NZDJPY",
    },
    {
      symbol: "CADJPY",
    },
    {
      symbol: "EURNZD",
    },
    {
      symbol: "AUDJPY",
    },
    {
      symbol: "GBPAUD",
    },
    {
      symbol: "AUDNZD",
    },
    {
      symbol: "EURCHF",
    },
    {
      symbol: "AUDUSD",
    },
    {
      symbol: "AUS200",
    },
    {
      symbol: "ESP35",
    },
    {
      symbol: "FRA40",
    },
    {
      symbol: "SPX500",
    },
    {
      symbol: "US30",
    },
    {
      symbol: "UK100",
    },
    {
      symbol: "JPN225",
    },
    {
      symbol: "GER30",
    },
    {
      symbol: "NAS100",
    },
  ];

  try {
    const pair = await prisma.pair.createMany({
      data: tradingPairs,
    });

    if (!pair) {
      return res.status(404).json({ error: "Pairs not added" });
    }

    res.status(200).json({ message: "Pairs added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/pairs", async (req, res) => {
  try {
    const pairs = await prisma.pair.findMany();
    res.status(200).json({ pairs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/deposit", async (req, res) => {
  const { email, amount } = req.body;

  console.log("email", email);
  console.log("amount", amount);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { availableFunds: { increment: amount } },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/withdraw", async (req, res) => {
  const { email, amount } = req.body;

  console.log("email", email);
  console.log("amount", amount);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { availableFunds: { decrement: amount } },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", (req, res) => {
  res.send("Cockpit");
});

module.exports = router;
