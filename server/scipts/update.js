const fs = require('fs');
const CsvReadableStream = require('csv-reader');
const { createClient } = require('redis');
const client = createClient({ url: 'redis://192.168.0.183:6379' });
client.on('error', (err) => console.log('Redis Client Error', err));

async function run() {
	await client.connect();
	let inputStream = fs.createReadStream('GeoLite2-City-Blocks-IPv4.csv', 'utf8');
	promiseArray = [];
	inputStream
		.pipe(new CsvReadableStream({ parseNumbers: true, asObject: true }))
		.on('data', async function (row) {
			//Showel all the rows into a promise array so can run them in parallel
			if (row.longitude && row.latitude) {
				//node-redis sux hard.. have to send it with sendCommand as the other commands seems broken af....
				promiseArray.push(await client.sendCommand(['GEOADD', 'ips', row.longitude + '', row.latitude + '', row.network]));
			}
		})
		.on('end', async function () {
			console.log('done parsing');
			const statuses = await Promise.allSettled(promiseArray);
			const rejections = statuses.filter((x) => x.status === 'rejected'); //shld work!?
			if (rejections.length > 0) {
				console.log(' failed: ', rejections);
			}
			console.log('done saving to redis');
			await client.disconnect();
			process.exit();
		});
}

run();
