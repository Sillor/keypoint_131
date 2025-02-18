const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { promisify } = require('util');
const nodemailer = require('nodemailer');

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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
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

                // Retrieve all admin emails
                db.query('SELECT email FROM users WHERE role = "admin"', (err, admins) => {
                    if (err) return res.status(500).json(err);

                    const adminEmails = admins.map(admin => admin.email);
                    const confirmationLink = `http://localhost:3000/pages/confirm-user/${results.insertId}`;

                    if (adminEmails.length > 0) {
                        const mailOptions = {
                            from: process.env.EMAIL_USER,
                            to: adminEmails,
                            subject: 'New User Registration Confirmation',
                            text: `A new user has registered.\n\nName: ${name}\nEmail: ${email}\nRole: ${role || 'user'}\n\nConfirm the registration here: ${confirmationLink}`
                        };

                        transporter.sendMail(mailOptions, (err, info) => {
                            if (err) {
                                console.error('Error sending email:', err);
                                return res.status(500).json({ message: 'User registered, but email notification failed' });
                            }
                            res.status(201).json({ message: 'User registered successfully, confirmation email sent to admins' });
                        });
                    } else {
                        res.status(201).json({ message: 'User registered successfully, but no admins found' });
                    }
                });
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

        // Check if the user is confirmed
        if (!user.confirmed) {
            return res.status(403).json({ message: 'Account not confirmed. Please wait for admin approval.' });
        }

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json(err);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

// Admin Confirms a User
app.post('/confirm-user/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;

    // Ensure only admins can perform this action
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    db.query('UPDATE users SET confirmed = 1 WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'User not found or already confirmed' });
        }

        res.json({ message: 'User confirmed successfully!' });
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
            // Regular user gets projects they are assigned to
            results = await query(`
                SELECT p.* FROM projects p
                JOIN project_users pu ON p.id = pu.project_id
                WHERE pu.user_id = ?`, [req.user.id]);
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

// Create a new project and assign users
app.post('/projects', authenticateToken, async (req, res) => {
    try {
        let { name, category, start_date, end_date, status, assignedUsers } = req.body;
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Only admins can create projects' });
        }

        // Set default dates if not provided
        if (!start_date || !end_date) {
            start_date = new Date().toISOString().split('T')[0];
            end_date = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
        }

        const query = promisify(db.query).bind(db);

        // Insert into projects table
        const result = await query(
            'INSERT INTO projects (name, category, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [name, category, start_date, end_date, status]
        );
        const projectId = result.insertId;

        // Assign admin to the created project
        await query('INSERT INTO project_users (project_id, user_id, role) VALUES (?, ?, ?)', [projectId, req.user.id, 'Manager']);

        // Assign users to project
        if (Array.isArray(assignedUsers) && assignedUsers.length > 0) {
            const values = assignedUsers.map(userId => [projectId, userId, 'collaborator']);
            await query('INSERT INTO project_users (project_id, user_id, role) VALUES ?', [values]);
        }

        res.status(201).json({ message: 'Project created successfully', id: projectId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Retrieve a project by ID (admin or assigned users only)
app.get('/projects/:id', authenticateToken, async (req, res) => {
    try {
        const projectId = req.params.id;
        const isAdmin = req.user.role === 'admin';
        const userId = req.user.id;

        const query = promisify(db.query).bind(db);

        let results;
        if (isAdmin) {
            results = await query('SELECT * FROM projects WHERE id = ?', [projectId]);
        } else {
            results = await query(`
                SELECT p.* FROM projects p
                JOIN project_users pu ON p.id = pu.project_id
                WHERE p.id = ? AND pu.user_id = ?`, [projectId, userId]);
        }

        if (results.length === 0) {
            return res.status(403).json({ message: 'Unauthorized or project not found' });
        }

        res.json(results[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Update a project (admin or assigned users) with email notifications to admins
app.put('/projects/:id', authenticateToken, async (req, res) => {
    try {
        const projectId = req.params.id;
        const updates = req.body;
        const isAdmin = req.user.role === 'admin';
        const userId = req.user.id;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        const allowedKeys = ['name', 'category', 'start_date', 'end_date', 'status'];
        const updateFields = Object.keys(updates).filter(key => allowedKeys.includes(key));

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Invalid project field(s) provided' });
        }

        const query = promisify(db.query).bind(db);

        // Check if user has access to this project
        const projectCheck = await query(`
            SELECT p.id, p.name FROM projects p
            JOIN project_users pu ON p.id = pu.project_id
            WHERE p.id = ? AND (pu.user_id = ? OR ? = true)`,
            [projectId, userId, isAdmin]
        );

        if (projectCheck.length === 0) {
            return res.status(403).json({ message: 'Unauthorized to update this project' });
        }

        // Update query dynamically
        let queryStr = `UPDATE projects SET `;
        let queryParams = [];

        updateFields.forEach((field, index) => {
            queryStr += index > 0 ? `, ?? = ?` : `?? = ?`;
            queryParams.push(field, updates[field]);
        });

        queryStr += ` WHERE id = ?`;
        queryParams.push(projectId);

        await query(queryStr, queryParams);

        // Fetch admin emails
        const adminInfo = await query(`SELECT email FROM users WHERE role = 'admin'`);

        if (adminInfo.length > 0) {
            const projectName = projectCheck[0].name;
            const adminEmails = adminInfo.map(admin => admin.email);
            const updateDetails = JSON.stringify(updates, null, 2);

            // Email details
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmails,
                subject: `Project Updated - ${projectName}`,
                text: `Hello Admins, \n\nThe project "${projectName}" has been updated.\n\nChanges:\n${updateDetails}\n\nBest Regards,\nProject Management System`
            };

            transporter.sendMail(mailOptions, (emailErr, info) => {
                if (emailErr) {
                    console.error('Error sending email:', emailErr);
                    return res.status(500).json({ message: 'Project updated, but failed to notify admins' });
                }
                res.json({ message: `Project ${projectId} updated successfully, notification sent to admins` });
            });
        } else {
            res.json({ message: `Project ${projectId} updated successfully, but no admins found` });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Delete a project (admin only)
app.delete('/projects/:id', authenticateToken, async (req, res) => {
    try {
        const projectId = req.params.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only admins can delete projects' });
        }

        const query = promisify(db.query).bind(db);

        // Check if the project exists before deleting
        const projectCheck = await query(`SELECT id FROM projects WHERE id = ?`, [projectId]);

        if (projectCheck.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete the project
        await query('DELETE FROM projects WHERE id = ?', [projectId]);

        res.json({ message: `Project ${projectId} deleted successfully` });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
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

        if (userId !== requestedId && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        const query = promisify(db.query).bind(db);
        const results = await query('SELECT * FROM kpis WHERE user_id = ? AND is_deleted = 0', [requestedId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No KPI data found for this user' });
        }

        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Update KPI endpoint with email notifications to admins
app.put('/kpi/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    const allowedKeys = ['category', 'kpi', 'description', 'target', 'uom', 'frequency', 'status'];
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

    db.query(query, queryParams, async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'KPI not found or unauthorized' });
        }

        // Fetch KPI details and admin emails
        const kpiQuery = promisify(db.query).bind(db);
        const kpiInfo = await kpiQuery(`SELECT kpi, category FROM kpis WHERE id = ?`, [id]);
        const adminInfo = await kpiQuery(`SELECT email FROM users WHERE role = 'admin'`);
        const userNameResult = await kpiQuery(`SELECT name FROM users WHERE id = ?`, [req.user.id]);
        const userName = userNameResult.length > 0 ? userNameResult[0].name : 'Unknown User';

        if (kpiInfo.length > 0 && adminInfo.length > 0) {
            const kpiName = kpiInfo[0].kpi;
            const category = kpiInfo[0].category;
            const adminEmails = adminInfo.map(admin => admin.email);
            const updateDetails = JSON.stringify(updates, null, 2);

            // Email details
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmails,
                subject: `KPI Updated by user ${userName} (ID: ${req.user.id})`,
                text: `Hello Admins, \n\nThe KPI "${kpiName}" in category "${category}" has been updated.\n\nChanges:\n${updateDetails}\n\nBest Regards,\nKPI Management System`
            };

            transporter.sendMail(mailOptions, (emailErr, info) => {
                if (emailErr) {
                    console.error('Error sending email:', emailErr);
                    return res.status(500).json({ message: 'KPI updated, but failed to notify admins' });
                }
                res.json({ message: `KPI ${id} updated successfully, notification sent to admins` });
            });
        } else {
            res.json({ message: `KPI ${id} updated successfully, but no admins found` });
        }
    });
});

// Soft Delete KPI
app.delete('/kpi/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        let query = `UPDATE kpis SET is_deleted = 1 WHERE id = ?`;
        let queryParams = [id];

        if (req.user.role !== 'admin') {
            query += ` AND user_id = ?`;
            queryParams.push(req.user.id);
        }

        const dbQuery = promisify(db.query).bind(db);
        const results = await dbQuery(query, queryParams);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'KPI not found or unauthorized' });
        }

        res.json({ message: `KPI ${id} marked as deleted successfully` });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
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


























// Create or Update Deliverable Detail
app.post('/deliverable_details/:project_id/:deliverable_id', authenticateToken, async (req, res) => {
    const { project_id, deliverable_id } = req.params;
    try {
        let { task_name, category, start_date, end_date, progress, status } = req.body;
        const isAdmin = req.user.role === 'admin';

        console.log('Deliverable ID:', deliverable_id, 'Project ID:', project_id, 'User:', req.user.id);

        // Ensure the user is assigned to the project
        const permissionCheckQuery = promisify(db.query).bind(db);
        const permissionCheck = await permissionCheckQuery(`
            SELECT 1 FROM project_users WHERE project_id = ? AND user_id = ?`,
            [project_id, req.user.id]
        );

        if (!isAdmin && permissionCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You are not assigned to this project' });
        }

        if (!start_date) start_date = new Date().toISOString().split('T')[0];
        if (!end_date) end_date = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

        const query = promisify(db.query).bind(db);
        const result = await query(
            `INSERT INTO deliverable_details (deliverable_id, task_name, category, start_date, end_date, progress, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE task_name = VALUES(task_name), category = VALUES(category), 
             start_date = VALUES(start_date), end_date = VALUES(end_date), progress = VALUES(progress), status = VALUES(status)`,
            [deliverable_id, task_name, category, start_date, end_date, progress, status]
        );

        res.status(201).json({ message: 'Deliverable detail saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Retrieve Deliverable Details by Deliverable ID
app.get('/deliverable_details/:deliverable_id', authenticateToken, async (req, res) => {
    try {
        const { deliverable_id } = req.params;
        const isAdmin = req.user.role === 'admin';

        // Ensure the user has permission
        const permissionCheckQuery = promisify(db.query).bind(db);
        const permissionCheck = await permissionCheckQuery(`
            SELECT 1 FROM project_users 
            WHERE project_id IN (SELECT project_id FROM deliverables WHERE id = ?) 
            AND user_id = ?`,
            [deliverable_id, req.user.id]
        );

        if (!isAdmin && permissionCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        const query = promisify(db.query).bind(db);
        const results = await query('SELECT * FROM deliverable_details WHERE deliverable_id = ?', [deliverable_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No deliverable details found for this deliverable' });
        }

        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Update Deliverable Detail
app.put('/deliverable_details/:project_id/:id', authenticateToken, async (req, res) => {
    try {
        const { project_id, id } = req.params;
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        const allowedKeys = ['task_name', 'category', 'start_date', 'end_date', 'progress', 'status'];
        const updateFields = Object.keys(updates).filter(key => allowedKeys.includes(key));

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Invalid deliverable detail field(s) provided' });
        }

        // Ensure user is assigned to the project
        const query = promisify(db.query).bind(db);
        const permissionCheck = await query(
            `SELECT 1 FROM project_users WHERE project_id = ? AND user_id = ?`,
            [project_id, req.user.id]
        );

        if (!req.user.role === 'admin' && permissionCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You are not assigned to this project' });
        }

        // Determine the status of the deliverable detail based on progress
        if (updates.progress) {
            if (updates.progress === '100%') {
                updates.status = 'Completed';
            } else if (updates.progress === '0%') {
                updates.status = 'Not started';
            } else {
                updates.status = 'In Progress';
            }

            // Ensure 'status' is included in updateFields
            if (!updateFields.includes('status')) {
                updateFields.push('status');
            }
        }

        // Ensure 'progress' is included in updateFields if not already
        if (!updateFields.includes('progress')) {
            updateFields.push('progress');
        }

        // Debugging
        console.log("Final Update Fields:", updateFields);
        console.log("Final Updates Object:", updates);

        // Update deliverable detail
        let updateQuery = `UPDATE deliverable_details SET `;
        let queryParams = [];

        updateFields.forEach((field, index) => {
            updateQuery += index > 0 ? `, ?? = ?` : `?? = ?`;
            queryParams.push(field, updates[field]);
        });

        updateQuery += ` WHERE id = ?`;
        queryParams.push(id);

        const updateResult = await query(updateQuery, queryParams);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Deliverable detail not found or unauthorized' });
        }

        // Get deliverable_id from the updated deliverable detail
        const deliverableDetail = await query(`SELECT deliverable_id FROM deliverable_details WHERE id = ?`, [id]);
        if (deliverableDetail.length === 0) {
            return res.status(404).json({ message: 'Deliverable detail not found' });
        }

        const deliverableId = deliverableDetail[0].deliverable_id;

        // Fetch all deliverable_details progress for the given deliverable
        const progressResults = await query(
            `SELECT progress FROM deliverable_details WHERE deliverable_id = ?`,
            [deliverableId]
        );

        // Convert progress values from "XX%" to numbers
        const allProgress = progressResults
            .map(row => parseFloat(row.progress.replace('%', '')))
            .filter(value => !isNaN(value)); // Ensure valid numbers

        // Calculate average progress
        const totalProgress = allProgress.reduce((acc, curr) => acc + curr, 0);
        const averageProgress = allProgress.length > 0 ? (totalProgress / allProgress.length) : 0;

        // Format back to string with '%'
        const formattedProgress = `${averageProgress.toFixed(2)}%`;

        // Determine deliverable status
        let deliverableStatus;
        if (allProgress.length === 0 || averageProgress === 0) {
            deliverableStatus = 'Not started';
        } else if (averageProgress === 100) {
            deliverableStatus = 'Completed';
        } else {
            deliverableStatus = 'In Progress';
        }

        // Update deliverable progress and status
        await query(`UPDATE deliverables SET progress = ?, status = ? WHERE id = ?`, [formattedProgress, deliverableStatus, deliverableId]);


        // Fetch project and admin details for email notification
        const projectInfo = await query(`SELECT name FROM deliverables WHERE id = ?`, [deliverableId]);
        const adminInfo = await query(`SELECT email FROM users WHERE role = 'admin'`);

        if (projectInfo.length > 0 && adminInfo.length > 0) {
            const projectName = projectInfo[0].name;
            const adminEmails = adminInfo.map(admin => admin.email);
            const updateDetails = JSON.stringify(updates, null, 2);

            // Email details
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmails,
                subject: `Deliverable Updated - Project: ${projectName}`,
                text: `Hello Admins, \n\nA deliverable detail (ID: ${id}) in project "${projectName}" has been updated.\n\nChanges:\n${updateDetails}\n\nBest Regards,\nProject Management System`
            };

            transporter.sendMail(mailOptions, (emailErr, info) => {
                if (emailErr) {
                    console.error('Error sending email:', emailErr);
                    return res.status(500).json({ message: 'Update successful, but failed to notify admins' });
                }
                res.json({ message: `Deliverable detail ${id} updated successfully, Deliverable status updated to ${deliverableStatus}, notification sent to admins` });
            });
        } else {
            res.json({ message: `Deliverable detail ${id} updated successfully, Deliverable status updated to ${deliverableStatus}, but no admins found` });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});


// Delete Deliverable Detail
app.delete('/deliverable_details/:project_id/:id', authenticateToken, async (req, res) => {
    const { project_id, id } = req.params;

    // Validate ID inputs
    const projectId = parseInt(project_id, 10);
    const taskId = parseInt(id, 10);

    if (isNaN(projectId) || isNaN(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID or project ID' });
    }

    // Ensure user has access to the project
    const permissionCheckQuery = promisify(db.query).bind(db);
    const permissionCheck = await permissionCheckQuery(`
        SELECT 1 FROM project_users WHERE project_id = ? AND user_id = ?`,
        [projectId, req.user.id]
    );

    if (!req.user.role === 'admin' && permissionCheck.length === 0) {
        return res.status(403).json({ message: 'Forbidden: You are not assigned to this project' });
    }

    let query = `DELETE FROM deliverable_details WHERE id = ?`;
    let queryParams = [taskId];

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ message: 'Database error occurred', error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Deliverable detail not found or unauthorized' });
        }
        res.json({ message: `Deliverable detail ${taskId} deleted successfully` });
    });
});





















// Retrieve Deliverables by Project ID (Exclude Soft Deleted)
app.get('/deliverables/:project_id', authenticateToken, async (req, res) => {
    try {
        const { project_id } = req.params;
        const isAdmin = req.user.role === 'admin';

        // Ensure the user has permission to access deliverables of the project
        const projectCheckQuery = promisify(db.query).bind(db);
        const projectCheck = await projectCheckQuery(
            `SELECT 1 FROM project_users WHERE project_id = ? AND user_id = ?`,
            [project_id, req.user.id]
        );

        if (!isAdmin && projectCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        const query = promisify(db.query).bind(db);
        const results = await query(`SELECT * FROM deliverables WHERE project_id = ? AND is_deleted = 0`, [project_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No deliverables found for this project' });
        }

        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.put('/deliverables/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        const allowedKeys = ['name', 'category', 'start_date', 'end_date', 'progress', 'status', 'project_id'];
        const updateFields = Object.keys(updates).filter(key => allowedKeys.includes(key));

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Invalid deliverable field(s) provided' });
        }

        const query = promisify(db.query).bind(db);

        // Check if the deliverable exists and get project_id
        const deliverableCheck = await query(`SELECT id, project_id FROM deliverables WHERE id = ?`, [id]);

        if (deliverableCheck.length === 0) {
            return res.status(404).json({ message: 'Deliverable not found' });
        }

        const projectId = deliverableCheck[0].project_id;

        // ✅ Update status based on progress
        if (updates.progress) {
            if (updates.progress === '100%') {
                updates.status = 'Completed';
            } else if (updates.progress === '0%') {
                updates.status = 'Not started';
            } else {
                updates.status = 'In Progress';
            }

            // Ensure 'status' is included in updateFields if progress is being updated
            if (!updateFields.includes('status')) {
                updateFields.push('status');
            }
        }

        let updateQuery = `UPDATE deliverables SET `;
        let queryParams = [];

        updateFields.forEach((field, index) => {
            updateQuery += index > 0 ? `, ?? = ?` : `?? = ?`;
            queryParams.push(field, updates[field]);
        });

        updateQuery += ` WHERE id = ?`;
        queryParams.push(id);

        const updateResult = await query(updateQuery, queryParams);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Deliverable not found or no changes made' });
        }

        // ✅ Check the progress of all non-deleted deliverables for the project
        const progressResults = await query(
            `SELECT progress FROM deliverables WHERE project_id = ? AND is_deleted = 0`,
            [projectId]
        );

        const allProgress = progressResults.map(row => row.progress);

        let projectStatus;
        if (allProgress.length === 0) {
            projectStatus = 'Not started'; // No active deliverables mean the project hasn't started
        } else if (allProgress.every(progress => progress === '100%')) {
            projectStatus = 'Completed';
        } else if (allProgress.every(progress => (progress === '0%' || progress === null))) {
            projectStatus = 'Not started';
        } else {
            projectStatus = 'In Progress';
        }

        // ✅ Update project status
        await query(`UPDATE projects SET status = ? WHERE id = ?`, [projectStatus, projectId]);

        res.json({ message: `Deliverable ${id} updated successfully, Project status updated to ${projectStatus}` });

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});


// Add a new Deliverable (Admin only)
app.post('/deliverables/:id', authenticateToken, async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only admins can add deliverables' });
        }

        const project_id = parseInt(req.params.id, 10);

        if (isNaN(project_id)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        let { name, category, start_date, end_date, progress, status } = req.body;

        if (!start_date) {
            start_date = new Date().toISOString().split('T')[0]; // Default to today
        }
        if (!end_date) {
            end_date = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]; // Default to next month
        }

        const query = promisify(db.query).bind(db);

        // Ensure the associated project exists
        const projectCheck = await query(`SELECT id FROM projects WHERE id = ?`, [project_id]);

        if (projectCheck.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Insert the new deliverable
        await query(
            `INSERT INTO deliverables (name, category, start_date, end_date, progress, status, project_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, category, start_date, end_date, progress || 0, status, project_id]
        );

        res.status(201).json({ message: 'Deliverable added successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Soft Delete Deliverable
app.delete('/deliverables/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure the user has permission to delete the deliverable
        const projectCheckQuery = promisify(db.query).bind(db);
        const projectCheck = await projectCheckQuery(
            `SELECT 1 FROM deliverables d 
             JOIN project_users pu ON d.project_id = pu.project_id 
             WHERE d.id = ? AND pu.user_id = ?`,
            [id, req.user.id]
        );

        if (projectCheck.length === 0 && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        const query = promisify(db.query).bind(db);
        const results = await query(`UPDATE deliverables SET is_deleted = 1 WHERE id = ?`, [id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Deliverable not found or unauthorized' });
        }

        res.json({ message: `Deliverable ${id} marked as deleted successfully` });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});










































// Retrieve all project-user relationships (Admin only)
app.get('/project-users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    db.query('SELECT id, project_id, user_id, role FROM project_users', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

// Retrieve users for a specific user (Admin only or self)
app.get('/projects/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.query('SELECT u.id, u.name, u.email, pu.role FROM users u JOIN project_users pu ON u.id = pu.user_id WHERE pu.project_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

// Create a new project-user relationship (Admin only)
app.post('/project-users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { project_id, user_id, role } = '';

    db.query('INSERT INTO project_users (project_id, user_id, role) VALUES (?, ?, ?)', [project_id, user_id, role], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'User added to project successfully' });
    });
});

// Update a field in a project-user relationship (Admin only)
app.put('/project-users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    const allowedKeys = ['project_id', 'user_id', 'role'];
    const updateFields = Object.keys(updates).filter(key => allowedKeys.includes(key));

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Invalid project-user field(s) provided' });
    }

    let query = `UPDATE project_users SET `;
    let queryParams = [];

    updateFields.forEach((field, index) => {
        query += index > 0 ? `, ?? = ?` : `?? = ?`;
        queryParams.push(field, updates[field]);
    });

    query += ` WHERE id = ?`;
    queryParams.push(id);

    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: `Project-user relationship ${id} updated successfully` });
    });
});

// Remove a user from a project (Admin only)
app.delete('/project-users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    db.query('DELETE FROM project_users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'User removed from project successfully' });
    });
});












app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
