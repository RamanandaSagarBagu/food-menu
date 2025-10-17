const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");

const FILE = "coupons.json";

// Get all coupons
router.get("/", async (req, res) => {
  const coupons = await readJSON(FILE);
  res.json(coupons);
});

// Validate coupon
router.post("/validate", async (req, res) => {
  const { code } = req.body;
  const coupons = await readJSON(FILE);
  const coupon = coupons.find(c => c.code === code);
  if (!coupon) return res.status(404).json({ valid: false, message: "Invalid coupon" });
  res.json({ valid: true, discount: coupon.discount, type: coupon.type });
});

// Add new coupon
router.post("/", async (req, res) => {
  const coupons = await readJSON(FILE);
  const newCoupon = { id: Date.now(), ...req.body };
  coupons.push(newCoupon);
  await writeJSON(FILE, coupons);
  res.status(201).json(newCoupon);
});

module.exports = router;
