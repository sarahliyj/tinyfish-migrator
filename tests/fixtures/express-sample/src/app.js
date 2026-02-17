const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

const router = express.Router();

router.get('/users', (req, res) => {
  const users = [{ id: 1, name: 'Alice' }];
  res.json(users);
});

router.post('/users', (req, res) => {
  const user = req.body;
  res.status(201).json(user);
});

app.use('/api', router);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
