const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// Port is handled by Cloudflare Worker environment usually, but kept for local fallback if needed
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Node.js Cloudflare Worker API", status: "ok" });
});

app.get('/debug/ping', (req, res) => {
    res.json({ message: 'pong' });
});

app.get('/debug/db', (req, res) => {
    res.json({ 
        hasDb: !!req.db, 
        dbType: typeof req.db,
        envKeys: process.env ? Object.keys(process.env) : 'no-process-env'
    });
});

// Helper validation to ensure DB is available
const checkDb = (req, res, next) => {
    if (!req.db) {
        return res.status(500).json({ error: 'Database binding not found' });
    }
    next();
};

app.use(checkDb);

// Register User
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user exists
        const existingUser = await req.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Insert user
        const result = await req.db.prepare(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
        ).bind(username, email, password).run();

        if (result.success) {
            res.json({ message: 'User registered successfully' });
        } else {
            res.status(500).json({ error: 'Failed to register user' });
        }
    } catch (err) {
        console.error('Register error', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await req.db.prepare(
            'SELECT * FROM users WHERE email = ? AND password = ?'
        ).bind(email, password).first();

        if (user) {
            res.json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Get all cat
app.get('/cat', async (req, res) => {
    try {
        const { results } = await req.db.prepare('SELECT * FROM cat').all();
        res.json(results);
    } catch (err) {
        console.error('Get cats error', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Get single cat
app.get('/cat/:id', async (req, res) => {
    try {
        const cat = await req.db.prepare('SELECT * FROM cat WHERE id = ?').bind(req.params.id).first();
        if (cat) {
            // Return as array to match previous API behavior if it expected array, 
            // but usually single object is better. Previous code returned `rows` which is array.
            // Let's return array to be safe or just the object if client expects object.
            // Previous code: res.json(rows) -> array.
            res.json([cat]); 
        } else {
            res.json([]); // Return empty array if not found to match previous behavior likely
        }
    } catch (err) {
        console.error('Get cat error', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Create a record
app.post('/cat', async (req, res) => {
    const { name, description, tag, img } = req.body;
    try {
        const result = await req.db.prepare(
            'INSERT INTO cat (name, description, tag, img) VALUES (?, ?, ?, ?)'
        ).bind(name, description, tag, img).run();

        if (result.success) {
            // D1 run() returns meta info, check docs for insertId. 
            // Cloudflare D1 result info often has `meta.last_row_id` or similar depending on client version,
            // but typically just success. Explicit ID fetch might be needed if strictly required.
            // For now return payload + success message.
            res.json({ 
                id: result.meta?.last_row_id || null, 
                name, description, tag, img, 
                message: 'Cat created successfully' 
            });
        } else {
            res.status(500).json({ error: 'Failed to create cat' });
        }
    } catch (err) {
        console.error('Create cat error', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Delete a record
app.delete('/cat/:id', async (req, res) => {
    try {
        const result = await req.db.prepare('DELETE FROM cat WHERE id = ?').bind(req.params.id).run();
        if (result.success) {
             res.json({ message: `Record Num: ${req.params.id} deleted successfully` });
        } else {
             res.status(500).json({ error: 'Failed to delete record' });
        }
    } catch (err) {
        console.error('Delete cat error', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Update a record
app.put('/cat/:id', async (req, res) => {
    const { name, description, tag, img } = req.body;
    try {
        const result = await req.db.prepare(
            'UPDATE cat SET name = ?, description = ?, tag = ?, img = ? WHERE id = ?'
        ).bind(name, description, tag, img, req.params.id).run();

        if (result.success) {
            res.json({ message: `Record Num: ${req.params.id} updated successfully` });
        } else {
            res.status(500).json({ error: 'Failed to update record' });
        }
    } catch (err) {
        console.error('Update cat error', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// List on the Port (only used if running locally via node, not worker)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;