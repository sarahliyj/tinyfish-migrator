function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = { id: 1 };
  next();
}

module.exports = authMiddleware;
