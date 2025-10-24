const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 🧩 Log the folder being served (for debugging)
const docsPath = path.resolve(__dirname, "../docs");
console.log("🧩 Serving static files from:", docsPath);

// ✅ Serve frontend files
app.use(express.static(docsPath));

// ✅ API routes
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);

// ✅ Serve HTML files correctly
app.get("/:page", (req, res) => {
  const file = req.params.page;
  const filePath = path.join(docsPath, file);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Page not found");
    }
  });
});

// ✅ Default route (homepage)
app.get("/", (req, res) => {
  res.sendFile(path.join(docsPath, "index.html"));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
