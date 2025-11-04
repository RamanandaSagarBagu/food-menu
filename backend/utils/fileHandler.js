const fs = require("fs-extra");
const path = require("path");

async function readJSON(fileName) {
  const filePath = path.join(__dirname, "../data", fileName);
  await fs.ensureFile(filePath); // create file if missing
  const exists = await fs.readFile(filePath, "utf8");
  if (!exists || exists.trim() === "") return [];
  return fs.readJson(filePath);
}

async function writeJSON(fileName, data) {
  const filePath = path.join(__dirname, "../data", fileName);
  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, data, { spaces: 2 });
}

module.exports = { readJSON, writeJSON };
