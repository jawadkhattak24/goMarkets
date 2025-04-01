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

router.get("/", (req, res) => {
  res.send("Cockpit");
});

module.exports = router;
