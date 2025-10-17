const fs = require("fs-extra");
const path = require("path");

async function readJSON(fileName) {
  const filePath = path.join(__dirname, "../data", fileName);
  const data = await fs.readJSON(filePath);
  return data;
}

async function writeJSON(fileName, data) {
  const filePath = path.join(__dirname, "../data", fileName);
  await fs.writeJSON(filePath, data, { spaces: 2 });
}

module.exports = { readJSON, writeJSON };
