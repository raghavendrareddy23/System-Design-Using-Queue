const amqp = require("amqplib");

let connection;
let channel;

const initRabbitMQ = async () => {
  try {
    connection = await amqp.connect('amqp://localhost:5672');
    channel = await connection.createChannel();
    console.log("RabbitMQ connected");
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
    setTimeout(initRabbitMQ, 5000);
  }
};

const getChannel = () => channel;

module.exports = { initRabbitMQ, getChannel };
