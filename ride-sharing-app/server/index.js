const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ridesharing", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

// Register API
app.post("/api/register", async (req, res) => {
  const { name, phone, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, phone, password: hashedPassword });

  try {
    await newUser.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;

  // Check if the user exists
  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expiration time (1 hour)
  });

  res.json({
    success: true,
    message: "Login successful",
    token, // Send the JWT token to the client
  });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
