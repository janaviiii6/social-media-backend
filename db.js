require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'social_media'
});

db.connect((err) => {
    if(err) {
        console.err('Error connecting to Mysql:',err.message);
        return;
    }
    console.log('Connected to the Mysql database');
});
module.exports = db;