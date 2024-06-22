const express = require("express");
const connectDB = require("./Config/db");
const { initRabbitMQ } = require("./Config/rabbitmq");
const router = require("./Routes/routes");
const { httpRequestDurationMicroseconds, client } = require("./Config/monitoring");
const errorHandler = require("./Middleware/errorMiddleware");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(router);
app.use(errorHandler);

app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route.path, code: res.statusCode });
    });
    next();
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

connectDB();
initRabbitMQ();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



const { startWorker } = require('./Controller/queueController');
startWorker();