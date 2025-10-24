const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 🧩 Serve frontend files from /docs folder
const staticPath = path.join(__dirname, "../docs");
app.use(express.static(staticPath));
console.log("🧩 Serving static files from:", staticPath);

// ✅ API routes
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);

// ✅ Handle direct HTML page requests (admin.html, cart.html, etc.)
app.get("/:page", (req, res) => {
  const filePath = path.join(staticPath, req.params.page);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("⚠️ Page not found:", filePath);
      res.status(404).sendFile(path.join(staticPath, "index.html"));
    }
  });
});

// ✅ Default route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
