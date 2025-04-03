const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const WebSocket = require("ws");
const axios = require("axios");

const prisma = new PrismaClient();
const app = express();

const allowedOrigins = [
  "https://go-markets-cockpit.vercel.app",
  "http://localhost:5173",
  "http://192.168.100.7:5173",
  "https://go-markets-mobile.vercel.app",
  "https://go-markets-client.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming request origin:", origin);
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

app.options("*", cors());

app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  next();
});

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

const cockpitRoutes = require("./routes/cockpit");
app.use("/api/cockpit", cockpitRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
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

let globalLastClose = 2985.5;
let globalTrend = Math.random() > 0.5 ? 1 : -1;
let globalTrendDuration = 0;
let globalMaxTrendDuration = Math.floor(Math.random() * 30) + 20;
let globalMomentum = 0;
let lastCandles = [];

async function generateRandomKlineData() {
  const now = Date.now();

  const trendChangeProbability =
    0.005 + (globalTrendDuration / globalMaxTrendDuration) * 0.03;
  if (Math.random() < trendChangeProbability) {
    globalTrend *= -1;
    globalTrendDuration = 0;
    globalMaxTrendDuration = Math.floor(Math.random() * 30) + 20;
    globalMomentum = 0;
  }

  const open = Number(globalLastClose.toFixed(2));

  globalMomentum += globalTrend * (Math.random() * 0.00002);
  globalMomentum = Math.max(Math.min(globalMomentum, 0.0003), -0.0003);

  const trendFactor =
    globalLastClose * 0.0001 * globalTrend * (0.5 + Math.random() * 0.8);
  const momentumFactor = globalLastClose * globalMomentum;
  const noiseFactor =
    globalLastClose *
    (Math.random() * 0.0002 - 0.0001) *
    (1 - Math.abs(globalMomentum) * 10);

  const movement = trendFactor + momentumFactor + noiseFactor;
  const close = Number((open + movement).toFixed(2));

  const isConsolidation = Math.random() < 0.15;
  const finalClose = isConsolidation
    ? Number((open + (Math.random() * 0.04 - 0.02)).toFixed(2))
    : close;

  const wickFactor = 0.05 + Math.random() * 0.15;
  let high, low;

  if (finalClose > open) {
    high = Number(
      (
        finalClose +
        Math.abs(finalClose - open) * wickFactor * (1 + Math.random() * 0.5)
      ).toFixed(2)
    );
    low = Number(
      (
        open -
        Math.abs(finalClose - open) * wickFactor * (0.5 + Math.random() * 0.5)
      ).toFixed(2)
    );
  } else {
    high = Number(
      (
        open +
        Math.abs(finalClose - open) * wickFactor * (0.5 + Math.random() * 0.5)
      ).toFixed(2)
    );
    low = Number(
      (
        finalClose -
        Math.abs(finalClose - open) * wickFactor * (1 + Math.random() * 0.5)
      ).toFixed(2)
    );
  }

  const rangeBottom = 2980.5;
  const rangeTop = 2999.5;

  if (finalClose < rangeBottom) {
    globalLastClose = rangeBottom + Math.random() * 0.3;
    globalTrend = 1;
    globalMomentum = 0.0001;
  } else if (finalClose > rangeTop) {
    globalLastClose = rangeTop - Math.random() * 0.3;
    globalTrend = -1;
    globalMomentum = -0.0001;
  } else {
    globalLastClose = finalClose;
  }

  if (Math.random() < 0.08) {
    globalLastClose = Number((open + (Math.random() * 0.02 - 0.01)).toFixed(2));
  }

  globalTrendDuration++;

  const newCandle = {
    Time: now,
    Open: open,
    High: high,
    Low: low,
    Close: globalLastClose,
    Volume: Math.floor(
      30000 + Math.random() * 40000 + Math.abs(globalLastClose - open) * 100000
    ),
    Amount: Math.floor(40000 * ((high + low) / 2)),
  };

  lastCandles.push(newCandle);
  if (lastCandles.length > 10) lastCandles.shift();

  return {
    code: 1,
    data: [newCandle],
  };
}

wss.on("connection", async (ws, req) => {
  console.log("New WebSocket client connected");
  let intervalId;

  const initialData = await generateRandomKlineData();
  ws.send(JSON.stringify(initialData));

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
