const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifytoken = require("../middleware/auth");
const router = express.Router();

// Sign-up
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sign-in
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
router.get("/profile", verifytoken, async (req, res) => {
  try {
    const { _id, username, email } = await User.findById(req.userId).exec()
    res.status(200).json({ user: { _id, username, email } })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
