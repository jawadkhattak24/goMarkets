const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

router.get("/user/positionHolding", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const trades = await prisma.trade.findMany({
      where: {
        userId: userId,
        status: "OPEN",
      },
      orderBy: {
        openTime: "desc",
      },
    });

    const formattedTrades = trades.map((trade) => ({
      ...trade,
      takeProfit: 0,
      setLoss: 0,
    }));

    res.status(200).json({ trades: formattedTrades });
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/user/tradeHistory", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    console.log("userId", userId);

    const trades = await prisma.trade.findMany({
      where: {
        userId: userId,
        status: "CLOSED",
      },
      orderBy: {
        closeTime: "desc",
      },
    });

    const formattedTrades = trades.map((trade) => ({
      ...trade,
      takeProfit: 0,
      setLoss: 0,
    }));

    res.status(200).json({ trades: formattedTrades });
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/user/openTrade", async (req, res) => {
  console.log("Trade order received");
  try {
    const {
      userId,
      symbol,
      direction,
      lots,
      price,
      margin,
      handlingFee,
      leverage,
    } = req.body;

    console.log(
      "Order Data",
      userId,
      symbol,
      direction,
      lots,
      price,
      margin,
      handlingFee,
      leverage
    );

    const reservationNumber =
      "#" +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
    const profit = 0.0;

    console.log("Send trade order to database");

    const trade = await prisma.trade.create({
      data: {
        userId: userId,
        transactionPairs: symbol,
        reservationNumber: reservationNumber,
        status: "OPEN",
        direction: direction.toUpperCase(),
        lots: parseFloat(lots),
        lowerUnitPrice: parseFloat(price),
        currentPrice: parseFloat(price),
        handlingFee: handlingFee,
        margin: margin,
        profit: profit,
        openTime: new Date(),
        closeTime: null,
      },
    });

    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    // });

    // const updatedUser = await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     availableFunds: user.availableFunds - margin,
    //   },
    // });

    // if (updatedUser) {
    //   console.log("User updated successfully", updatedUser);
    // } else {
    //   console.log("User update failed");
    // }

    if (trade) {
      console.log("Trade opened successfully", trade);
    } else {
      console.log("Trade opening failed");
    }

    res.status(201).json({ message: "Trade opened successfully", trade });
  } catch (error) {
    console.error("Error opening trade:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/user/closeTrade", async (req, res) => {
  try {
    const { Id, currentPrice, profit } = req.body;

    console.log("Closing trade with:", { Id, currentPrice, profit });

    const existingTrade = await prisma.trade.findUnique({
      where: { id: Id },
    });

    if (!existingTrade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    const trade = await prisma.trade.update({
      where: { id: Id },
      data: {
        status: "CLOSED",
        currentPrice: currentPrice,
        profit: profit,
        closeTime: new Date(),
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: existingTrade.userId },
    });

    const updatedUser = await prisma.user.update({
      where: { id: existingTrade.userId },
      data: {
        availableFunds: user.availableFunds + profit,
      },
    });

    if (updatedUser) {
      console.log("User updated successfully");
    } else {
      console.log("User update failed");
    }

    console.log("Trade closed successfully", trade);

    res.status(200).json({ message: "Trade closed successfully", trade });
  } catch (error) {
    console.error("Error closing trade:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
