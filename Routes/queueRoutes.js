const express = require('express');
const { enqueue } = require('../Controller/queueController');
const isAuthenticated = require("../Middleware/authMiddleware")

const queueRouter = express.Router();

queueRouter.post('/enqueue',isAuthenticated, enqueue);

module.exports = queueRouter;
