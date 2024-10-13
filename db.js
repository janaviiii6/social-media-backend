const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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