const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || total <= 0) {
      return res.status(400).json({ error: "Invalid order" });
    }

    const order = await Order.create({ items, total });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
};
