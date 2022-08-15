const { createClient } = require('redis');
const redisClient = createClient({ url: process.env.REDIS_CONNECT_STRING });
redisClient.connect().catch((err) => {
	console.error('Failed to to connect to redis!\n'); //print message if failed to connect n then just throw the error n let error handler handle it
	throw err;
});

module.exports = redisClient;
