const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

require('dotenv').config();

// MongoDB connection
const isDocker = process.env.DOCKER || false; // Using env var
const PORT = isDocker ? 5000 : 5000;

const mongoURI = isDocker
    ? process.env.MONGODB_URI // Environment variable from Docker Compose
    : 'mongodb://localhost:27017/coinflip_game';

console.log(`MongoDB URI: ${mongoURI}`); // debug

// Waiter for MongoDB connection
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(mongoURI);
            console.log(`Connected to MongoDB at ${mongoURI}`);
            return;
        } catch (err) {
            console.error(`MongoDB connection error (attempt ${i + 1}/${retries}):`, err.message);
            if (i === retries - 1) {
                console.error('Failed to connect to MongoDB after multiple attempts. Exiting.');
                process.exit(1); // Exit the process if unable to connect
            }
            await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retry
        }
    }
};

connectWithRetry();

// DB user schema
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    balance: { type: Number, default: 100 } // Start balance 100uah
});

const User = mongoose.model('User', userSchema);

// Middleware for JSON parsing
app.use(express.json());

// Middleware for CORS
const cors = require('cors');
app.use(cors());

// Register
function validateUserData(email, password) {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // I hate regular expressions :)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return trimmedEmail.length > 0 && trimmedPassword.length > 0 && emailRegex.test(trimmedEmail);
}

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!validateUserData(email, password)) {
        return res.status(400).json({ error: 'Email and Password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered, you can Login now!' });
    } catch (error) {
        res.status(400).json({ error: 'Register error.' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Wrong email or password.' });
    }

    const token = jwt.sign({ id: user._id }, 'your_secret_key'); // My Mongo secret key :)
    res.json({ message: 'Successful login!', token });
});

// Logout
const revokedTokens = new Set(); // Storage of revoked tokens

app.post('/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'Token not received' });
    }

    // Add token to revoked
    revokedTokens.add(token);

    res.status(200).json({ message: 'Exit successful' });
});

// Get user balance
app.get('/balance', async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, 'your_secret_key');

    const user = await User.findById(decoded.id);
    res.json({ balance: user.balance });
});

// Game
app.post('/play', async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, 'your_secret_key');
    const user = await User.findById(decoded.id);

    const { bet, choice } = req.body; // choice = "black", "red" або "zero"

    const spinResult = Math.floor(Math.random() * 37); // number from 0 to 36
    let resultColor;

    if (spinResult === 0) {
        resultColor = "zero";
    } else if ([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(spinResult)) {
        resultColor = "black";
    } else {
        resultColor = "red";
    }

    let message;
    if (!user || user.balance < bet) {
        return res.status(400).json({ message: "Not enough money" });
    }
    if (choice === resultColor) {
        if (resultColor === "zero") {
            user.balance += Number(bet) * 36;
            await user.save();
            message = `Zero! You wom ${bet * 36} UAH!`;
        } else {
            user.balance += Number(bet);
            await user.save();
            message = `You won ${bet} UAH!`;
        }
    } else {
        user.balance -= Number(bet);
        await user.save();
        message = `You lose! Roulette stopped on ${spinResult} (${resultColor}).`;
    }

    res.json({ message, balance: user.balance });
});

//add money
app.post('/add-money', async (req, res) => {
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, 'your_secret_key');
        const user = await User.findById(decoded.id);

        const { amount } = req.body;
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        user.balance += Number(amount);
        await user.save();

        return res.status(200).json({
            message: `Balance successfully added: ${amount} UAH!`,
            new_balance: user.balance
        });
    });
//return res.status(400).json({ error: 'Token not received' });

// Start of server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
