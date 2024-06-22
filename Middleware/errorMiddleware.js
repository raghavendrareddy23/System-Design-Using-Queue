const logger = require('../Config/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: err.message });
};

module.exports = errorHandler;
