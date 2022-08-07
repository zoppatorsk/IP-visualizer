const { createClient } = require('redis');
const redisClient = createClient({ url: process.env.REDIS_CONNECT_STRING });
redisClient.connect();

module.exports = redisClient;
