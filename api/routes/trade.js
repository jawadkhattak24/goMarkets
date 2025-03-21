const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

router.get("/user/positionHolding", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

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
    const userId = decoded.id;

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
    const { userId, symbol, direction, lots, price } = req.body;

    console.log(userId, symbol, direction, lots, price);

    const reservationNumber =
      "#" +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
    const handlingFee = parseFloat((lots * 0.09541).toFixed(6));
    const margin = parseFloat((lots * 95.40964).toFixed(2));
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

    if (trade) {
      console.log("Trade opened successfully");
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
    const { Id, price, profit } = req.body;

    // Log the request data for debugging
    console.log("Closing trade with:", { Id, price, profit });

    // First check if the trade exists
    const existingTrade = await prisma.trade.findUnique({
      where: { id: Id },
    });

    if (!existingTrade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Then update it
    const trade = await prisma.trade.update({
      where: { id: Id },
      data: {
        status: "CLOSED",
        currentPrice: price,
        profit: profit,
        closeTime: new Date(),
      },
    });

    console.log("Trade closed successfully", trade);

    res.status(200).json({ message: "Trade closed successfully", trade });
  } catch (error) {
    console.error("Error closing trade:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
