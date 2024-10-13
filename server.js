const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});