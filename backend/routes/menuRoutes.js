const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");

const FILE = "menu.json";

// Get all menu items
router.get("/", async (req, res) => {
  try {
    const menu = await readJSON(FILE);
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: "Failed to load menu items" });
  }
});

// Add new item
router.post("/", async (req, res) => {
  try {
    const menu = await readJSON(FILE);
    const newItem = { id: Date.now(), ...req.body };
    menu.push(newItem);
    await writeJSON(FILE, menu);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add item" });
  }
});

// Update item
router.put("/:id", async (req, res) => {
  try {
    const menu = await readJSON(FILE);
    const id = parseInt(req.params.id);
    const index = menu.findIndex((i) => i.id === id);
    if (index === -1) return res.status(404).send("Item not found");
    menu[index] = { ...menu[index], ...req.body };
    await writeJSON(FILE, menu);
    res.json(menu[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Delete item
router.delete("/:id", async (req, res) => {
  try {
    const menu = await readJSON(FILE);
    const id = parseInt(req.params.id);
    const filtered = menu.filter((i) => i.id !== id);
    await writeJSON(FILE, filtered);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;
