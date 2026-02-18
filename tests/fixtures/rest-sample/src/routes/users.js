const express = require('express');
const router = express.Router();

router.get('/api/v1/users', (req, res) => {
  const users = [{ id: 1, name: 'Alice' }];
  res.status(200).json(users);
});

router.post('/api/v1/users', (req, res) => {
  const user = req.body;
  res.status(201).json(user);
});

router.put('/api/v1/users/:id', (req, res) => {
  res.status(200).json({ updated: true });
});

router.delete('/api/v1/users/:id', (req, res) => {
  res.status(204).send();
});

// Method checking middleware
function methodHandler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ data: [] });
  } else if (req.method === 'POST') {
    res.status(201).json({ created: true });
  }
}

module.exports = router;
