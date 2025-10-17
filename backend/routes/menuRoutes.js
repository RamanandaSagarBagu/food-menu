const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");

const FILE = "menu.json";

// Get all menu items
router.get("/", async (req, res) => {
  const menu = await readJSON(FILE);
  res.json(menu);
});

// Add new item
router.post("/", async (req, res) => {
  const menu = await readJSON(FILE);
  const newItem = { id: Date.now(), ...req.body };
  menu.push(newItem);
  await writeJSON(FILE, menu);
  res.status(201).json(newItem);
});

// Update item
router.put("/:id", async (req, res) => {
  const menu = await readJSON(FILE);
  const id = parseInt(req.params.id);
  const index = menu.findIndex(i => i.id === id);
  if (index === -1) return res.status(404).send("Item not found");
  menu[index] = { ...menu[index], ...req.body };
  await writeJSON(FILE, menu);
  res.json(menu[index]);
});

// Delete item
router.delete("/:id", async (req, res) => {
  const menu = await readJSON(FILE);
  const id = parseInt(req.params.id);
  const filtered = menu.filter(i => i.id !== id);
  await writeJSON(FILE, filtered);
  res.json({ message: "Deleted successfully" });
});

module.exports = router;
