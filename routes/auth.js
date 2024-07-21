const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const config = require('../config');

// Registration endpoint
router.post('/register', async (req, res) => {
    const { username, password } = req.body; // phone removed since it's commented in HTML
    console.log('Registration request:', req.body); // Logging request body

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists');
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        console.log('User registered successfully');
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Server error:', error); // Logging the error
        res.status(500).json({ error: 'Server error' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request:', req.body); // Logging request body

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('Invalid credentials');
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid credentials');
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const payload = { id: user.id, username: user.username };
        jwt.sign(payload, config.secretOrKey, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token: 'Bearer ' + token });
        });
    } catch (error) {
        console.error('Server error:', error); // Logging the error
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
