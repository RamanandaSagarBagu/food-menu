const express = require("express");
const router = express.Router();
const { readJSON } = require("../utils/fileHandler");

const FILE = "coupons.json";

router.get("/", async (req, res) => {
  const coupons = await readJSON(FILE);
  res.json(coupons);
});

module.exports = router;
