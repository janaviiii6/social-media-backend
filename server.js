const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');

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

app.use('/images',express.static('images'));

//POST request
app.post('/submit',upload.any(), async (req,res) => {
    
    const {name, userName } = req.body;
    let images;

    if(req.files.length > 1) {
        images = JSON.stringify(req.files.map(file => file.filename));
    } else if(req.files.length === 1) {
        images = req.files[0].filename;
    } else {
        images = [];
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    const defaultPassword = userName.toLowerCase() + randomNum;
    
    //Hash the default password
    const hashedPassword = await bcrypt.hash(defaultPassword,10);
    
    const sql = `INSERT INTO user_details (name, username, password, images, role) VALUES (?,?,?,?,'USER')`;
    
    db.query(sql, [name, userName, hashedPassword, images], (err, result) => {
        if(err) {
            console.error('Error inserting user data:',err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'User data submitted successfully', defaultPassword });
    }); 
});

app.post('/admin-login', (req, res) => {
    const { username, password } = req.body; 
    const sql = `SELECT * FROM user_details WHERE username = ? AND role = 'ADMIN'`;
    console.log(sql);

    db.query(sql, [username], async (err, result) => {
        if (err) {
            console.log(username);
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        console.log('Query Result:', result);
        if (result.length === 0) {
            console.log(`No user found with that username: ${username}`);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = result[0];
        console.log('User fetched:', user);

        try {
            
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                console.log('Password mismatch');
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            console.log('Login successful');
            return res.status(200).json({ message: 'Login successful' });
        } catch (error) {
            console.error('Error comparing passwords:', error);
            return res.status(500).json({ message: 'Server error during login' });
        }
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

        const users = results.map(user => {
            let images;

            if (user.images.startsWith('[') && user.images.endsWith(']')) {
                try {
                    images = JSON.parse(user.images);
                } catch (e) {
                    console.error('Error parsing images:', e.message);
                    images = [user.images]; 
                }
            } else {
                images = [user.images];
            }

            return {
                ...user,
                images
            };
        });

        res.status(200).json(users);
    });
});

//Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});