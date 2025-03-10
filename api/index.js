const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
