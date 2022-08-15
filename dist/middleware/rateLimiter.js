const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../services/redis');

const rateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 6, // Limit each IP to 6 requests per `window` (here, per 1 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	store: new RedisStore({
		sendCommand: (...args) => redisClient.sendCommand(args),
	}),
});
module.exports = rateLimiter;
