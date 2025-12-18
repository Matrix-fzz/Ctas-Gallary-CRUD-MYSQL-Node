const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_proj'
});

connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
        console.error('Error fetching users:', err);
    } else {
        console.log('Users in DB:', results);
    }
    connection.end();
});
