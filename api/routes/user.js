const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userAuth = require("../middlewares/userAuth");
const { sendVerificationEmail } = require("../utils/emailService");

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/send-verification-email", async (req, res) => {
  const { email } = req.body;
  try {
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    console.log("Sending verification email");
    const emailSent = await sendVerificationEmail(email, verificationCode);
    console.log("Verification email sent successfully", emailSent);
    if (emailSent) {
      const existingVerificationCode = await prisma.verificationCode.findUnique(
        {
          where: { email },
        }
      );
      console.log("Existing verification code", existingVerificationCode);

      if (existingVerificationCode) {
        console.log("Deleting existing verification code");
        await prisma.verificationCode.delete({
          where: { id: existingVerificationCode.id },
        });
      }

      console.log("Creating new verification code");
      const verificationCodeRes = await prisma.verificationCode.create({
        data: {
          email,
          code: verificationCode,
          expiresAt: verificationCodeExpires,
        },
      });

      console.log(
        "Verification code created successfully",
        verificationCodeRes
      );

      res.status(200).json({ message: "Verification email sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send verification email" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, verificationCode } = req.body;

  try {
    console.log("Checking verification code");
    const dbVerificationCode = await prisma.verificationCode.findUnique({
      where: { email },
    });

    if (!dbVerificationCode) {
      return res.status(400).json({ error: "No verification code found" });
    }

    console.log("DB verification code", dbVerificationCode);
    if (dbVerificationCode.code !== verificationCode) {
      console.log("Invalid verification code");
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (new Date() > dbVerificationCode.expiresAt) {
      console.log("Verification code expired");
      return res.status(400).json({ error: "Verification code expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = Math.floor(Math.random() * 1000000);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        availableFunds: 0,
        uid,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        availableFunds: true,
        verificationStatus: true,
        emailVerified: true,
      },
    });

    console.log("User registered successfully", user);

    return res.status(200).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ error: "No verification code found" });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode,
        verificationCodeExpires,
      },
    });

    const emailSent = await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      message: "Verification code resent successfully",
      emailSent,
    });
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
        uid: true,
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
