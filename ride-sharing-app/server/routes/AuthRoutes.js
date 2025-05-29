const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ensure correct path

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
    try {
        const { phone, password } = req.body; // Use phone instead of email

        // Check if user exists
        const user = await User.findOne({ phone });
        if (!user) return res.status(400).json({ msg: "User not found" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user._id, phone: user.phone } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
});


module.exports = router;
