const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");

const FILE = "orders.json";

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await readJSON(FILE);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to load orders" });
  }
});

// Create an order
router.post("/", async (req, res) => {
  try {
    const orders = await readJSON(FILE);
    const newOrder = {
      id: Date.now(),
      items: req.body.items || [],
      total: req.body.total || 0,
      status: req.body.status || "Processing",
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    await writeJSON(FILE, orders);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update order (status or other fields)
router.put("/:id", async (req, res) => {
  try {
    const orders = await readJSON(FILE);
    const id = parseInt(req.params.id);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return res.status(404).send("Not found");
    orders[idx] = { ...orders[idx], ...req.body };
    await writeJSON(FILE, orders);
    res.json(orders[idx]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Delete order (optional)
router.delete("/:id", async (req, res) => {
  try {
    const orders = await readJSON(FILE);
    const id = parseInt(req.params.id);
    const filtered = orders.filter(o => o.id !== id);
    await writeJSON(FILE, filtered);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
