const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");

const FILE = "orders.json";

router.get("/", async (req, res) => {
  const orders = await readJSON(FILE);
  res.json(orders);
});

router.post("/", async (req, res) => {
  const orders = await readJSON(FILE);
  const newOrder = { id: Date.now(), ...req.body };
  orders.push(newOrder);
  await writeJSON(FILE, orders);
  res.status(201).json(newOrder);
});

router.put("/:id", async (req, res) => {
  const orders = await readJSON(FILE);
  const id = parseInt(req.params.id);
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).send("Not found");
  orders[idx] = { ...orders[idx], ...req.body };
  await writeJSON(FILE, orders);
  res.json(orders[idx]);
});

module.exports = router;
