const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userAuth = require("../middlewares/userAuth");

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        availableFunds: 478,
      },
      select: {
        id: true,
        email: true,
        availableFunds: true,
        verificationStatus: true,
      },
    });
    res.status(200).json({ message: "User registered successfully", user });
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

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const email = decoded.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        availableFunds: true,
        verificationStatus: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("User", user);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/real-name-verification", async (req, res) => {
  const {
    currentUser: { email },
  } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User", user);
    user.verificationStatus = "AUDITING";
    await prisma.user.update({ where: { id: user.id }, data: user });

    res.status(200).json({ message: "Verification submitted for auditing" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
