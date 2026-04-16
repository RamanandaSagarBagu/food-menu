exports.validateOrder = (req, res, next) => {
  const { items, total } = req.body;

  if (!items || !Array.isArray(items) || total <= 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  next();
};
