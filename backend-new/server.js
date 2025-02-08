const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { promisify } = require('util');

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
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

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






























// Retrieve projects (admin gets all, user gets only their projects)
app.get('/projects', authenticateToken, async (req, res) => {
    try {
        const query = promisify(db.query).bind(db);
        let results;

        if (req.user.role === 'admin') {
            // Admin gets all projects
            results = await query('SELECT * FROM projects');
        } else {
            // Regular user gets only their projects
            results = await query('SELECT * FROM projects WHERE user_id = ?', [req.user.id]);
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No projects found' });
        }

        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Create or Update Project by user ID (self or admin access)
app.post('/projects/:id', authenticateToken, async (req, res) => {
    try {
        let { name, category, start_date, end_date, status } = req.body;
        const userId = String(req.user.id);
        const isAdmin = req.user.role === 'admin';
        const requestedId = String(req.params.id);

        if (userId !== requestedId && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        if (!name || !category || !start_date || !end_date || status === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = promisify(db.query).bind(db);
        const result = await query(
            'INSERT INTO projects (user_id, name, category, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), start_date = VALUES(start_date), end_date = VALUES(end_date), status = VALUES(status)',
            [requestedId, name, category, start_date, end_date, status]
        );

        res.status(201).json({ message: 'Project saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Retrieve Projects by user ID (self or admin access)
app.get('/projects/:id', authenticateToken, async (req, res) => {
    try {
        const userId = String(req.user.id);
        const isAdmin = req.user.role === 'admin';
        const requestedId = String(req.params.id);

        if (userId !== requestedId && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        const query = promisify(db.query).bind(db);
        const results = await query('SELECT * FROM projects WHERE user_id = ?', [requestedId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No projects found for this user' });
        }

        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Update Project endpoint
app.put('/projects/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    const allowedKeys = ['name', 'category', 'start_date', 'end_date', 'status'];
    const updateFields = Object.keys(updates).filter(key => allowedKeys.includes(key));

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Invalid project field(s) provided' });
    }

    let query = `UPDATE projects SET `;
    let queryParams = [];

    updateFields.forEach((field, index) => {
        query += index > 0 ? `, ?? = ?` : `?? = ?`;
        queryParams.push(field, updates[field]);
    });

    query += ` WHERE id = ?`;
    queryParams.push(id);

    if (req.user.role !== 'admin') {
        query += ` AND user_id = ?`;
        queryParams.push(req.user.id);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found or unauthorized' });
        }
        res.json({ message: `Project ${id} updated successfully` });
    });
});

// Delete Project endpoint
app.delete('/projects/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    let query = `DELETE FROM projects WHERE id = ?`;
    let queryParams = [id];

    if (req.user.role !== 'admin') {
        query += ` AND user_id = ?`;
        queryParams.push(req.user.id);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found or unauthorized' });
        }
        res.json({ message: `Project ${id} deleted successfully` });
    });
});











// Create or Update KPI by user ID (self or admin access)
app.post('/kpi/:id', authenticateToken, async (req, res) => {
    try {
        let { category, kpi, description, target, uom, frequency, status } = req.body;
        const userId = String(req.user.id);
        const isAdmin = req.user.role === 'admin';
        const requestedId = String(req.params.id);

        console.log('User ID:', requestedId, 'Category:', category, 'KPI:', kpi, 'Target:', target, 'UOM:', uom, 'Frequency:', frequency, 'Status:', status);

        // Ensure users can only post to their own ID unless they are an admin
        if (userId !== requestedId && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        if (!category && !kpi && !target && !uom && !frequency && status === undefined) {
            category = '';
            kpi = '';
            target = 0;
            uom = '';
            frequency = '';
            status = '';
        }

        const sanitizedTarget = target === '' ? 10 : parseInt(target, 10);

        // Using async/await with promisified query
        const query = promisify(db.query).bind(db);
        const result = await query(
            'INSERT INTO kpis (user_id, category, kpi, description, target, uom, frequency, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE category = VALUES(category), kpi = VALUES(kpi), description = VALUES(description), target = VALUES(target), uom = VALUES(uom), frequency = VALUES(frequency), status = VALUES(status)',
            [requestedId, category, kpi, description, sanitizedTarget, uom, frequency, status]
        );

        res.status(201).json({ message: 'KPI data saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Retrieve KPI by user ID (self or admin access)
app.get('/kpi/:id', authenticateToken, async (req, res) => {
    try {
        const userId = String(req.user.id);
        const isAdmin = req.user.role === 'admin';
        const requestedId = String(req.params.id);

        // Ensure users can only access their own ID unless they are an admin
        if (userId !== requestedId && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        // Using async/await with promisified query
        const query = promisify(db.query).bind(db);
        const results = await query('SELECT * FROM kpis WHERE user_id = ?', [requestedId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No KPI data found for this user' });
        }

        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Update KPI endpoint
app.put('/kpi/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    const allowedKeys = ['category', 'kpi', 'description', 'target', 'uom', 'frequency', 'status'
    ]; // Define valid fields
    const updateFields = Object.keys(updates).filter(key => allowedKeys.includes(key));

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Invalid KPI field(s) provided' });
    }

    // Build update query dynamically
    let query = `UPDATE kpis SET `;
    let queryParams = [];

    updateFields.forEach((field, index) => {
        query += index > 0 ? `, ?? = ?` : `?? = ?`;
        queryParams.push(field, updates[field]);
    });

    query += ` WHERE id = ?`;
    queryParams.push(id);

    // Restrict non-admins to updating only their own KPIs
    if (req.user.role !== 'admin') {
        query += ` AND user_id = ?`;
        queryParams.push(req.user.id);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'KPI not found or unauthorized' });
        }
        res.json({ message: `KPI ${id} updated successfully` });
    });
});

app.delete('/kpi/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    // Restrict non-admins to deleting only their own KPIs
    let query = `DELETE FROM kpis WHERE id = ?`;
    let queryParams = [id];

    if (req.user.role !== 'admin') {
        query += ` AND user_id = ?`;
        queryParams.push(req.user.id);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'KPI not found or unauthorized' });
        }
        res.json({ message: `KPI ${id} deleted successfully` });
    });
});











// Retrieve all users (Admin only)
app.get('/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    db.query('SELECT id, name, email, role, created_at FROM users', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

// Retrieve a specific user (Admin only)
app.get('/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]);
    });
});

// Update user details (Admin only)
app.put('/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const updates = req.body;
    const allowedKeys = ['name', 'email', 'role']; // Allowed fields to update
    const updateFields = Object.keys(updates).filter(key => allowedKeys.includes(key));

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Invalid user field(s) provided' });
    }

    let query = `UPDATE users SET `;
    let queryParams = [];

    updateFields.forEach((field, index) => {
        query += index > 0 ? `, ?? = ?` : `?? = ?`;
        queryParams.push(field, updates[field]);
    });

    query += ` WHERE id = ?`;
    queryParams.push(id);

    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `User ${id} updated successfully` });
    });
});

// Delete user (Admin only)
app.delete('/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `User ${id} deleted successfully` });
    });
});
































// Retrieve deliverables (admin gets all, user gets only their deliverables linked to projects they own)
app.get('/deliverables', authenticateToken, async (req, res) => {
    try {
        const query = promisify(db.query).bind(db);
        let results;

        if (req.user.role === 'admin') {
            results = await query('SELECT * FROM deliverables');
        } else {
            results = await query('SELECT * FROM deliverables WHERE project_id IN (SELECT id FROM projects WHERE user_id = ?)', [req.user.id]);
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No deliverables found' });
        }

        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Create or Update Deliverable
app.post('/deliverables/:id', authenticateToken, async (req, res) => {
    try {
        let { project_id, name, category, start_date, end_date, progress, status } = req.body;
        const isAdmin = req.user.role === 'admin';

        // Ensure the user has permission to modify the deliverable
        const projectCheckQuery = promisify(db.query).bind(db);
        const projectCheck = await projectCheckQuery('SELECT * FROM projects WHERE id = ? AND user_id = ?', [project_id, req.user.id]);

        if (!isAdmin && projectCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        if (!project_id || !name || !category || !start_date || !end_date || progress === undefined || status === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = promisify(db.query).bind(db);
        const result = await query(
            'INSERT INTO deliverables (project_id, name, category, start_date, end_date, progress, status) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), start_date = VALUES(start_date), end_date = VALUES(end_date), progress = VALUES(progress), status = VALUES(status)',
            [project_id, name, category, start_date, end_date, progress, status]
        );

        res.status(201).json({ message: 'Deliverable saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Retrieve Deliverables by Project ID
app.get('/deliverables/:project_id', authenticateToken, async (req, res) => {
    try {
        const { project_id } = req.params;
        const isAdmin = req.user.role === 'admin';

        // Ensure the user has permission to access deliverables of the project
        const projectCheckQuery = promisify(db.query).bind(db);
        const projectCheck = await projectCheckQuery('SELECT * FROM projects WHERE id = ? AND user_id = ?', [project_id, req.user.id]);

        if (!isAdmin && projectCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        const query = promisify(db.query).bind(db);
        const results = await query('SELECT * FROM deliverables WHERE project_id = ?', [project_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No deliverables found for this project' });
        }

        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Update Deliverable
app.put('/deliverables/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    const allowedKeys = ['name', 'category', 'start_date', 'end_date', 'progress', 'status'];
    const updateFields = Object.keys(updates).filter(key => allowedKeys.includes(key));

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Invalid deliverable field(s) provided' });
    }

    let query = `UPDATE deliverables SET `;
    let queryParams = [];

    updateFields.forEach((field, index) => {
        query += index > 0 ? `, ?? = ?` : `?? = ?`;
        queryParams.push(field, updates[field]);
    });

    query += ` WHERE id = ?`;
    queryParams.push(id);

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Deliverable not found or unauthorized' });
        }
        res.json({ message: `Deliverable ${id} updated successfully` });
    });
});

// Delete Deliverable
app.delete('/deliverables/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    let query = `DELETE FROM deliverables WHERE id = ?`;
    let queryParams = [id];

    if (req.user.role !== 'admin') {
        query += ` AND project_id IN (SELECT id FROM projects WHERE user_id = ?)`;
        queryParams.push(req.user.id);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Deliverable not found or unauthorized' });
        }
        res.json({ message: `Deliverable ${id} deleted successfully` });
    });
});





















































app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
