import { createClient } from 'redis';
import CsvReadableStream from 'csv-reader';
import { createReadStream } from 'fs';
const redisClient = createClient({ url: process.env.REDIS_CONNECT_STRING });

async function slowLoad(file) {
	await redisClient.connect().catch((err) => {
		console.error('Failed to to connect to redis! Check your REDIS_CONNECT_STRING in .env');
		process.exit();
	});

	let inputStream = createReadStream(file, 'utf8');
	let counter = 0;
	inputStream
		.pipe(new CsvReadableStream({ asObject: true }))
		.on('data', async function (row) {
			if (row.longitude && row.latitude) {
				try {
					await redisClient.sendCommand(['GEOADD', 'ips', row.longitude + '', row.latitude + '', row.network]);
					counter++;
					console.log(`${counter} rows processed`);
				} catch (error) {
					console.error('redis_err', error);
				}
			}
		})
		.on('end', async function () {
			console.log('Update complete');
			process.exit();
		});
}

export default slowLoad;
