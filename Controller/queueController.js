const retry = require("retry");
const Request = require("../Model/requestModel");
const { getChannel } = require("../Config/rabbitmq");
const User = require("../Model/authModel");
const logger = require("../Config/logger");

const QUEUE_NAME = "user_requests";

const createQueue = async (username) => {
    const channel = getChannel();
    await channel.assertQueue(`${QUEUE_NAME}_${username}`);
    return channel;
};

const enqueueRequest = async (username, request) => {
    const channel = await createQueue(username);
    channel.sendToQueue(`${QUEUE_NAME}_${username}`, Buffer.from(JSON.stringify(request)));
    const newRequest = new Request({ username, request });
    await newRequest.save();
};

const enqueue = async (req, res) => {
    const { request } = req.body;
    try {
        logger.info(`Enqueuing request for user: ${req.user.username}, task: ${request.task}`);
        await enqueueRequest(req.user.username, request);
        res.status(200).json({message:'Request enqueued'});
    } catch (error) {
        logger.error('Error enqueuing request:', error);
        res.status(500).json({message:'Error enqueuing request'});
    }
};

const processRequest = async (username, request) => {
    logger.info(`Processing request for ${username}: ${JSON.stringify(request)}`);
    
    if (Math.random() < 0.5) {
        throw new Error("Processing failed");
    }
};

const processQueue = async (username) => {
    try {
        const channel = getChannel();
        const queueName = `${QUEUE_NAME}_${username}`;

        await channel.assertQueue(queueName);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const request = JSON.parse(msg.content.toString());
                logger.info(`Received request for ${username}: ${JSON.stringify(request)}`);

                const operation = retry.operation({
                    retries: 3,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 60000,
                    randomize: true,
                });

                operation.attempt(async (currentAttempt) => {
                    try {
                        await processRequest(username, request);
                        channel.ack(msg);
                        logger.info(`Successfully processed request for ${username}, task: ${request.task}`);
                    } catch (error) {
                        logger.error(`Error processing request for ${username}: ${error.message}, task: ${request.task}`);
                        if (operation.retry(error)) {
                            logger.info(`Retrying processing for ${username}, task: ${request.task}, attempt ${currentAttempt}`);
                            return;
                        }
                        logger.error(`Failed to process request for ${username} and task: ${request.task} after ${currentAttempt} attempts`);
                    }
                });
            }
        });
    } catch (error) {
        logger.error(`Error processing queue for ${username}: ${error.message}`);
        throw new Error(`Error processing queue for ${username}`);
    }
};

const startWorker = async () => {
    try {
        const users = await User.find({});
        for (const user of users) {
            await processQueue(user.username);
        }
        logger.info('Worker started for processing queues');
    } catch (error) {
        logger.error(`Error starting worker: ${error.message}`);
        throw new Error("Error starting worker");
    }
};

module.exports = { enqueue, startWorker };