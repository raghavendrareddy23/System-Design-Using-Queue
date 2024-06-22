const amqp = require("amqplib");

let connection;
let channel;

const rabbitMQUri = process.env.RABBITMQ_URI||'amqp://guest:guest@localhost:5672/'

const initRabbitMQ = async () => {
  try {
    connection = await amqp.connect(rabbitMQUri);
    channel = await connection.createChannel();
    console.log("RabbitMQ connected");
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
    setTimeout(initRabbitMQ, 5000);
  }
};

const getChannel = () => channel;

module.exports = { initRabbitMQ, getChannel };
