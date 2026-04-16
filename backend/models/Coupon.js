const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: String,
  discount: Number,
  type: String,
  expiry: Date
});

module.exports = mongoose.model("Coupon", couponSchema);
