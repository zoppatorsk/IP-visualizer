const { createClient } = require('redis');
const redisClient = createClient({ url: process.env.MODE == 'prod' ? process.env.REDIS_CONNECT_STRING_PROD : process.env.REDIS_CONNECT_STRING });

module.exports = redisClient;
