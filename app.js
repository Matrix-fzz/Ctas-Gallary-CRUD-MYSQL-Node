const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_proj',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


// Register User
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('DB connection error', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        // Check if user exists
        connection.query('SELECT * FROM users WHERE email = ?', [email], (qErr, rows) => {
            if (qErr) {
                connection.release();
                console.error('Query error', qErr);
                return res.status(500).json({ error: 'Query error' });
            }
            if (rows.length > 0) {
                connection.release();
                return res.status(400).json({ error: 'User already exists' });
            }
            // Insert user
            connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (insertErr, result) => {
                connection.release();
                if (insertErr) {
                    console.error('Insert error', insertErr);
                    return res.status(500).json({ error: 'Insert error' });
                }
                res.json({ message: 'User registered successfully' });
            });
        });
    });
});

// Login User
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('DB connection error', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error('Query error', qErr);
                return res.status(500).json({ error: 'Query error' });
            }
            if (rows.length > 0) {
                res.json({ message: 'Login successful', user: rows[0] });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// Get all cat
app.get('/cat', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('DB connection error', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        connection.query('SELECT * FROM cat', (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error('Query error', qErr);
                return res.status(500).json({ error: 'Query error' });
            }
            res.json(rows);
        });
    });
});

// Get single cat
app.get('/cat/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('DB connection error', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        connection.query('SELECT * FROM cat WHERE id = ?', [req.params.id], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error('Query error', qErr);
                return res.status(500).json({ error: 'Query error' });
            }
            res.json(rows);
        });
    });
});

// Create a record
app.post('/cat', (req, res) => {
    const { name, description, tag, img } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('DB connection error', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        connection.query('INSERT INTO cat (name, description, tag, img) VALUES (?, ?, ?, ?)', [name, description, tag, img], (qErr, result) => {
            connection.release();
            if (qErr) {
                console.error('Query error', qErr);
                return res.status(500).json({ error: 'Query error' });
            }
            res.json({ id: result.insertId, name, description, tag, img, message: 'Cat created successfully' });
        });
    });
});

// Delete a record
app.delete('/cat/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('DB connection error', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        connection.query('DELETE FROM cat WHERE id = ?', [req.params.id], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error('Query error', qErr);
                return res.status(500).json({ error: 'Query error' });
            }
            res.json({ message: `Record Num: ${req.params.id} deleted successfully` });
        });
    });
});

// Update a record
app.put('/cat/:id', (req, res) => {
    const { name, description, tag, img } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('DB connection error', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        connection.query('UPDATE cat SET name = ?, description = ?, tag = ?, img = ? WHERE id = ?', [name, description, tag, img, req.params.id], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error('Query error', qErr);
                return res.status(500).json({ error: 'Query error' });
            }
            res.json({ message: `Record Num: ${req.params.id} updated successfully` });
        });
    });
});

// List on the Port
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;