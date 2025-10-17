const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");

const FILE = "orders.json";

// Get all orders
router.get("/", async (req, res) => {
  const orders = await readJSON(FILE);
  res.json(orders);
});

// Place new order
router.post("/", async (req, res) => {
  const orders = await readJSON(FILE);
  const newOrder = {
    id: Date.now(),
    items: req.body.items || [],
    total: req.body.total || 0,
    status: "Processing",
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  await writeJSON(FILE, orders);
  res.status(201).json(newOrder);
});

// Update order status
router.put("/:id", async (req, res) => {
  const orders = await readJSON(FILE);
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).send("Order not found");
  order.status = req.body.status || order.status;
  await writeJSON(FILE, orders);
  res.json(order);
});

module.exports = router;
