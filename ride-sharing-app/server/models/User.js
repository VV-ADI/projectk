const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ridesharing", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Define User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  phoneNumber: { type: String, unique: true },
  password: String,
  age: Number,
  gender: String,
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

// Register API
app.post("/api/auth/register", async (req, res) => {
  const { name, phoneNumber, password, age, gender } = req.body;

  // Validate required fields
  if (!name || !phoneNumber || !password || !age || !gender) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ msg: "User with this phone number already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      phoneNumber,
      password: hashedPassword,
      age,
      gender,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with success and token
    res.json({ token });

  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
