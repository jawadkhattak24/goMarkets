const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const WebSocket = require("ws");
const axios = require("axios");
const marketDataService = require("./services/marketDataService");

const prisma = new PrismaClient();
const app = express();

const allowedOrigins = [
  "https://go-markets-cockpit.vercel.app",
  "http://localhost:5173",
  "http://192.168.100.3:5173",
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
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

const clients = new Map();

const supportedSymbols = {
  'XAUUSD': 2000 
};

Object.entries(supportedSymbols).forEach(([symbol, basePrice]) => {
  marketDataService.initializeSymbol(symbol, basePrice)
    .then(() => console.log(`Initialized ${symbol} with base price ${basePrice}`))
    .catch(error => console.error(`Failed to initialize ${symbol}:`, error));
});

wss.on("connection", async (ws, req) => {
  console.log("New WebSocket client connected from:", req.socket.remoteAddress);
  
  const clientData = {
    ws,
    symbol: 'XAUUSD',
    streamInterval: null
  };
  clients.set(ws, clientData);

  try {
    const initialData = await marketDataService.getAllCandles(clientData.symbol);
    ws.send(JSON.stringify({
      type: 'initial',
      data: initialData
    }));

    clientData.streamInterval = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          const nextCandle = await marketDataService.getNextCandle(clientData.symbol);
          ws.send(JSON.stringify({
            type: 'update',
            data: nextCandle
          }));
        } catch (error) {
          console.error('Error streaming candle:', error);
        }
      }
    }, 1000);

    ws.on("close", () => {
      if (clientData.streamInterval) {
        clearInterval(clientData.streamInterval);
      }
      clients.delete(ws);
      console.log("Client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      if (clientData.streamInterval) {
        clearInterval(clientData.streamInterval);
      }
      clients.delete(ws);
    });

  } catch (error) {
    console.error("Error setting up client connection:", error);
    ws.close();
  }
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  for (const symbol of Object.keys(supportedSymbols)) {
    await marketDataService.stopDataGeneration(symbol);
  }
  process.exit(0);
});

app.get("/ws-test", (req, res) => {
  res.json({
    status: "WebSocket server running",
    wsClients: wss.clients.size,
    serverTime: new Date().toISOString(),
    wsServerStatus: wss.readyState,
  });
});

wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

wss.on('listening', () => {
    console.log('WebSocket server is listening');
});
