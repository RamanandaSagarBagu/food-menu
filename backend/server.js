const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve all frontend files from /docs folder
app.use(express.static(path.join(__dirname, "../docs")));

// ✅ API routes
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);

// ✅ Fallback route to handle pages like /admin.html, /cart.html, etc.
app.get("*", (req, res) => {
  const filePath = path.join(__dirname, "../docs", req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      // If file not found, redirect to homepage
      res.sendFile(path.join(__dirname, "../docs/index.html"));
    }
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
