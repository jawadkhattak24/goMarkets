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

module.exports = router;
