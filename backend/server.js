require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// 🧩 Serve frontend
const staticPath = path.join(__dirname, "../docs");
app.use(express.static(staticPath));

// ✅ Routes
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);

// ✅ Page routing
app.get("/:page", (req, res) => {
  const filePath = path.join(staticPath, req.params.page);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(staticPath, "index.html"));
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
