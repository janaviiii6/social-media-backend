const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//GET request for fetching user details
app.get('/user-details',(req,res) => {
    const sql = 'SELECT * FROM user_details';

    db.query(sql,(err,results) => {
        if(err) {
            console.err('Error fetching user-details:', err.message);
            return res.status(500).json({ error: 'Database Error' });
        }
        res.status(200).json(results);
    });
});

//Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});