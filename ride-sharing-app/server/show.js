const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Import Ride, User, and Vehicle models
const Ride = mongoose.model("Ride");
const User = mongoose.model("User");
const Vehicle = mongoose.model("Vehicle");

// GET /api/rides - Show all published rides (for search page)
router.get("/api/rides", async (req, res) => {
  try {
    // Optionally, you can add filters here (e.g., from, to, date)
    const rides = await Ride.find({ status: "active" })
      .populate("driver", "-password")
      .populate("vehicle")
      .sort({ date: 1, "time.hour": 1, "time.minute": 1 });

    res.json({ success: true, rides });
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ success: false, message: "Error fetching rides" });
  }
});

module.exports = router;