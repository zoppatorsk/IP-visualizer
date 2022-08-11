const express = require('express');
const router = express.Router();
const processData = require('../modules/processData');
const validate = require('../services/validate');
const rateLimiter = require('../middleware/rateLimiter');
const redisClient = require('../services/redis');

router.post('/', rateLimiter, async (req, res) => {
	// Validate the input
	const validationError = await validate.data(req.body);
	if (validationError) return res.status(400).send(validationError);

	const { lat, lng, radius } = req.body;
	const data = await redisClient.sendCommand(['GEORADIUS', 'ips', lng + '', lat + '', radius + '', 'km', 'WITHCOORD']);
	const compiled = processData(data);
	return res.status(200).send(compiled);
}); //end router.post

module.exports = router;
