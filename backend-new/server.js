const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// User Registration
app.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json(err);
        db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hash, role || 'user'],
            (err, results) => {
                if (err) return res.status(500).json(err);
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    });
});

// User Authentication (Login)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = results[0];
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json(err);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

// Projects Routes (Authenticated)
app.get('/projects', authenticateToken, (req, res) => {
    let query = 'SELECT * FROM projects WHERE user_id = ?';
    let params = [req.user.id];

    if (req.user.role === 'admin') {
        query = 'SELECT * FROM projects';
        params = [];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Retrieve specific project
app.get('/projects/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    let query = 'SELECT * FROM projects WHERE id = ? AND user_id = ?';
    let params = [id, req.user.id];

    if (req.user.role === 'admin') {
        query = 'SELECT * FROM projects WHERE id = ?';
        params = [id];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'Project not found' });
        res.json(results[0]);
    });
});

// Delete project (only owner or admin)
app.delete('/projects/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    let query = 'DELETE FROM projects WHERE id = ? AND user_id = ?';
    let params = [id, req.user.id];

    if (req.user.role === 'admin') {
        query = 'DELETE FROM projects WHERE id = ?';
        params = [id];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Project not found or unauthorized' });
        res.json({ message: 'Project deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
