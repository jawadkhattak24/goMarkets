const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const WebSocket = require("ws");
const axios = require("axios");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    await prisma.$connect();
    res.send("Postgres connected successfully");
  } catch (error) {
    console.error("DB Connection Error:", error);
    res.status(500).send("Database Connection Failed!");
  }
});

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const tradeRoutes = require("./routes/trade");
app.use("/api/trade", tradeRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocket.Server({
  server: server,
  path: "/ws",
  clientTracking: true,
});

wss.on("error", (error) => {
  console.error("WebSocket Server Error:", error);
});

// Keep track of the last price between updates
let globalLastClose = 2985.50;
let globalTrend = Math.random() > 0.5 ? 1 : -1;
let globalTrendDuration = 0;
let globalMaxTrendDuration = Math.floor(Math.random() * 30) + 20;
let globalMomentum = 0; // Add momentum to create more natural movements
let lastCandles = []; // Store recent candles to create more natural patterns

async function generateRandomKlineData() {
  const now = Date.now();
  
  // Natural trend changes with probability that increases over time
  const trendChangeProbability = 0.005 + (globalTrendDuration / globalMaxTrendDuration) * 0.03;
  if (Math.random() < trendChangeProbability) {
    globalTrend *= -1;
    globalTrendDuration = 0;
    globalMaxTrendDuration = Math.floor(Math.random() * 30) + 20;
    globalMomentum = 0; // Reset momentum on trend change
  }

  // Calculate new candle
  const open = Number(globalLastClose.toFixed(2));
  
  // Add momentum factor that builds up gradually in trend direction
  globalMomentum += globalTrend * (Math.random() * 0.00002);
  // Limit maximum momentum
  globalMomentum = Math.max(Math.min(globalMomentum, 0.0003), -0.0003);
  
  // Calculate price movement with multiple factors
  const trendFactor = globalLastClose * 0.0001 * globalTrend * (0.5 + Math.random() * 0.8);
  const momentumFactor = globalLastClose * globalMomentum;
  const noiseFactor = globalLastClose * (Math.random() * 0.0002 - 0.0001) * (1 - Math.abs(globalMomentum) * 10);
  
  // Combine factors for final movement
  const movement = trendFactor + momentumFactor + noiseFactor;
  const close = Number((open + movement).toFixed(2));

  // Occasionally create small consolidation patterns
  const isConsolidation = Math.random() < 0.15;
  const finalClose = isConsolidation ? 
    Number((open + (Math.random() * 0.04 - 0.02)).toFixed(2)) : 
    close;

  // Calculate high and low with variable wick sizes
  const wickFactor = 0.05 + Math.random() * 0.15; // Variable wick sizes
  let high, low;
  
  if (finalClose > open) {
    // Bullish candle
    high = Number((finalClose + Math.abs(finalClose - open) * wickFactor * (1 + Math.random() * 0.5)).toFixed(2));
    low = Number((open - Math.abs(finalClose - open) * wickFactor * (0.5 + Math.random() * 0.5)).toFixed(2));
  } else {
    // Bearish candle
    high = Number((open + Math.abs(finalClose - open) * wickFactor * (0.5 + Math.random() * 0.5)).toFixed(2));
    low = Number((finalClose - Math.abs(finalClose - open) * wickFactor * (1 + Math.random() * 0.5)).toFixed(2));
  }

  // Keep price within range but with soft boundaries
  const rangeBottom = 2980.50;
  const rangeTop = 2999.50;
  
  if (finalClose < rangeBottom) {
    // Stronger bounce when hitting bottom
    globalLastClose = rangeBottom + Math.random() * 0.3;
    globalTrend = 1; // Force upward trend after hitting bottom
    globalMomentum = 0.0001; // Add upward momentum
  } else if (finalClose > rangeTop) {
    // Stronger drop when hitting top
    globalLastClose = rangeTop - Math.random() * 0.3;
    globalTrend = -1; // Force downward trend after hitting top
    globalMomentum = -0.0001; // Add downward momentum
  } else {
    globalLastClose = finalClose;
  }

  // Occasionally create dojis (open ≈ close)
  if (Math.random() < 0.08) {
    globalLastClose = Number((open + (Math.random() * 0.02 - 0.01)).toFixed(2));
  }

  globalTrendDuration++;
  
  // Store this candle for pattern analysis
  const newCandle = {
    Time: now,
    Open: open,
    High: high,
    Low: low,
    Close: globalLastClose,
    Volume: Math.floor(30000 + Math.random() * 40000 + Math.abs(globalLastClose - open) * 100000),
    Amount: Math.floor(40000 * ((high + low) / 2))
  };
  
  lastCandles.push(newCandle);
  if (lastCandles.length > 10) lastCandles.shift();

  return {
    code: 1,
    data: [newCandle]
  };
}

// Update WebSocket connection handler to send data more frequently
wss.on("connection", async (ws, req) => {
  console.log("New WebSocket client connected");
  let intervalId;

  // Send initial data
  const initialData = await generateRandomKlineData();
  ws.send(JSON.stringify(initialData));

  // Send updates every second
  intervalId = setInterval(async () => {
    if (ws.readyState === WebSocket.OPEN) {
      const data = await generateRandomKlineData();
      ws.send(JSON.stringify(data));
    }
  }, 10000);

  ws.on("close", () => {
    clearInterval(intervalId);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clearInterval(intervalId);
  });
});

app.get("/ws-test", (req, res) => {
  res.json({
    status: "WebSocket server running",
    wsClients: wss.clients.size,
  });
});
