const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/game_explorer');

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(port, () => {
    console.log('Server is running on port: ' + port);
});
