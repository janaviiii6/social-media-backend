const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const multer = require('multer');
const fs = require('fs');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//storage to handle multiple image uploads
const storage = multer.diskStorage({
    destination: (req,file, cb) => {
        cb(null,'images/');
    },
    filename: (req,file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

//POST request
app.post('/submit',upload.any(),(req,res) => {
    
    const {name, userName } = req.body;
    let images;

    if(req.files.length === 1) {
        images = req.files[0].filename;
    } else if(req.files.length > 1) {
        images = req.files.map(file => file.filename);
    } else {
        images = [];
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    const defaultPassword = userName.toLowerCase() + randomNum;
    
    
    const sql = `INSERT INTO user_details (name, username, password, images, role) VALUES (?,?,?,?,'USER')`;
    
    db.query(sql, [name, userName, defaultPassword, images], (err, result) => {
        if(err) {
            console.error('Error inserting user data:',err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'User data submitted successfully', defaultPassword });
    }); 
});

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