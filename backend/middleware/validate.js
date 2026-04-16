exports.validateOrder = (req, res, next) => {
  const { items, total } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items required" });
  }

  if (!total || total <= 0) {
    return res.status(400).json({ error: "Invalid total amount" });
  }

  next();
};
