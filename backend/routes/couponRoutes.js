const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");

const FILE = "coupons.json";

// Get all coupons
router.get("/", async (req, res) => {
  try {
    const coupons = await readJSON(FILE);
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: "Failed to load coupons" });
  }
});

// Create a coupon
router.post("/", async (req, res) => {
  try {
    const coupons = await readJSON(FILE);
    const newCoupon = { id: Date.now(), ...req.body };
    coupons.push(newCoupon);
    await writeJSON(FILE, coupons);
    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

// Update coupon
router.put("/:id", async (req, res) => {
  try {
    const coupons = await readJSON(FILE);
    const id = parseInt(req.params.id);
    const idx = coupons.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ error: "Coupon not found" });
    coupons[idx] = { ...coupons[idx], ...req.body };
    await writeJSON(FILE, coupons);
    res.json(coupons[idx]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

// Delete coupon
router.delete("/:id", async (req, res) => {
  try {
    const coupons = await readJSON(FILE);
    const id = parseInt(req.params.id);
    const filtered = coupons.filter(c => c.id !== id);
    await writeJSON(FILE, filtered);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

// Validate coupon (optional)
router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body;
    const coupons = await readJSON(FILE);
    const coupon = coupons.find(c => c.code === code);
    if (!coupon) return res.status(404).json({ valid: false, message: "Invalid coupon" });
    res.json({ valid: true, discount: coupon.discount, type: coupon.type });
  } catch (err) {
    res.status(500).json({ error: "Validation failed" });
  }
});

module.exports = router;
