const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { validateOrder } = require("../middleware/validate");

// ✅ Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to load orders" });
  }
});

// ✅ Create order (with validation)
router.post("/", validateOrder, async (req, res) => {
  try {
    const { items, total } = req.body;

    const newOrder = await Order.create({
      items,
      total,
      status: "Processing",
      paymentStatus: "Pending"
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Update order
router.put("/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ✅ Delete order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
