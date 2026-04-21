const express = require("express");
const app = express();
const db = require("./connection");
const bcrypt = require('bcrypt');  
const session = require("express-session");
const port = 8888;

//  Session Configuration 
app.use(session({
    secret: 'eventhub_secret', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 } // 1 hour session
}));

app.use(express.json());

// Middleware to protect routes 
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send({ Message: "Unauthorized: Please log in" });
    }
};



// Registration 
app.post('/api/auth/register', async (req, res) => {
    const { full_name, email, phone, password } = req.body;
    try {
        if (!full_name || !email || !phone || !password) {
            return res.status(400).send({ Message: "All fields required" }); // [cite: 50]
        }
        const [check_email] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (check_email.length > 0) {
            return res.status(409).send({ Message: "The email already exists" }); // [cite: 51]
        }
        
        // Phone validation (10-15 digits) 
        if (isNaN(phone) || phone.length < 10 || phone.length > 15) {
            return res.status(400).send({ Message: "Phone must be numbers between 10-15 digits" });
        }

        if (password.length < 6 || password.length > 8) {
            return res.status(400).send({ Message: 'Password must be 6-8 characters' }); // [cite: 54]
        }

        const hash = await bcrypt.hash(password, 10); // [cite: 54]
        const sql = "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";
        await db.query(sql, [full_name, email, phone, hash]);
        
        res.status(201).send({ Message: "The user created successfully" });
    } catch (error) {
        res.status(500).send({ Message: "Internal server error" });
    }
});

// Login 
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            return res.status(404).send({ Message: 'User not found' });
        }

        const result = user[0];
        const pass = await bcrypt.compare(password, result.password);
        if (!pass) {
            return res.status(401).send({ Message: "Incorrect password" });
        }

        // store the user in session
        req.session.user = { id: result.id, name: result.name, email: result.email };
        res.status(200).send({ Message: "Login successfully" });
        
    } catch (error) {
        res.status(500).send({ Message: "Internal server error" });
    }
});

// Logout 
app.get('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.status(200).send({ Message: "Logged out successfully" });
});


//  Get current user 
app.get('/api/auth/me', isAuthenticated, (req, res) => {
    res.status(200).send(req.session.user);
});

//  EVENT ROUTES

// Create Event 
// Updated Create Event Route
app.post('/api/events', isAuthenticated, async (req, res) => {
    
    const { title, description, location, event_date } = req.body; 
    try {
        
        const sql = "INSERT INTO events (title, description, location, event_date, user_id) VALUES (?, ?, ?, ?, ?)";
        
        await db.query(sql, [title, description, location, event_date, req.session.user.id]);
        
        res.status(201).send({ Message: "Event created successfully" });
    } catch (error) {
        console.error("Database Error:", error.message); 
        res.status(500).send({ Message: "Error creating event", Error: error.message });
    }
});
// Get all events
app.get('/api/events', isAuthenticated, async (req, res) => {
    const [events] = await db.query("SELECT * FROM events WHERE user_id = ?", [req.session.user.id]);
    res.status(200).send(events);
});

//  Get single event 
app.get('/api/events/:id', isAuthenticated, async (req, res) => {
    const [event] = await db.query("SELECT * FROM events WHERE id = ? AND user_id = ?", [req.params.id, req.session.user.id]);
    if (event.length === 0) {
        return res.status(404).send({ Message: "Event not found" });
    }
    res.status(200).send(event[0]);
});

// Update Event 
app.put('/api/events/:id', isAuthenticated, async (req, res) => {
    const { title, description, location, date } = req.body;
    await db.query("UPDATE events SET title=?, description=?, location=?, date=? WHERE id=? AND user_id=?", 
    [title, description, location, date, req.params.id, req.session.user.id]);
    res.send({ Message: "Event updated" });
});

// Delete Event 
app.delete('/api/events/:id', isAuthenticated, async (req, res) => {
    await db.query("DELETE FROM events WHERE id=? AND user_id=?", [req.params.id, req.session.user.id]);
    res.send({ Message: "Event deleted" });
});

app.listen(port, () => {
    console.log(`Server running: http://localhost:${port}`);
});