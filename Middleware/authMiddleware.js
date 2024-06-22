const jwt = require('jsonwebtoken');
const User = require('../Model/authModel');

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication token is missing or invalid' });
        }

        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        console.error('Authentication error:', error);  // Debug logging
        res.status(401).json({ message: 'Please authenticate', error: error.message });
    }
};


module.exports = isAuthenticated;
