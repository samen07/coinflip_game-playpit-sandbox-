const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/coinflip', { useNewUrlParser: true, useUnifiedTopology: true });

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
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });

    try {
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

// Add to user balance
// Withdraw from user balance
// Game
app.post('/play', async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, 'your_secret_key');

    const user = await User.findById(decoded.id);
    const bet = Number(req.body.bet);

    if (bet > user.balance) {
        return res.status(400).json({ error: 'Not enough money' });
    }

    // Coinflip game logic
    const result = Math.random() < 0.5 ? 'win' : 'lose'; // Random result

    if (result === 'win') {
        user.balance = Number(user.balance) + Number(bet); //win
        //user.balance += bet;
        await user.save();
        res.json({ message: 'You win!', newBalance: user.balance });
    } else {
        user.balance = Number(user.balance) - Number(bet); //lose
        await user.save();
        res.json({ message: 'You lose!', newBalance: user.balance });
    }
});

// Start of server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
