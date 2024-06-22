const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Model/authModel');
require('dotenv').config();

const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }
    
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            message:
              "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one digit, and one special symbol",
          });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = new User({
          username,
          password: hashedPassword,
        });
    
        await user.save();
    
        res.status(201).json({ message: "User created successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
            res.json({userId: user._id, Username:user.username, Token:token });
        } else {
            res.status(401).json({message:'Invalid credentials'});
        }
    } catch (error) {
        res.status(500).json({message:'Error logging in'});
    }
};

module.exports = { register, login };
