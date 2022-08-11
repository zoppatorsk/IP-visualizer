const spawn = require('child_process').spawn;
const fs = require('fs');
const CsvReadableStream = require('csv-reader');
const redisPipe = spawn(`redis-cli -h ${process.env.REDIS_CONNECT_STRING}`, ['--pipe']);

redisPipe.stdout.setEncoding('utf8');
redisPipe.stdout.pipe(process.stdout);
redisPipe.stderr.pipe(process.stderr);

//const file = './files/./files/GeoLite2-City-Blocks-IPv4.csv';
const BUFFER_SIZE = 524288; // 512KB
let buffer = '';

async function updateWithCLI(file) {
	let inputStream = fs.createReadStream(file, 'utf8');
	console.log('Let the piping commence! Pleas wait...');

	inputStream
		.pipe(new CsvReadableStream({ asObject: true }))
		.on('data', async function (row) {
			if (row.longitude && row.latitude) {
				buffer += encodeRedis(`geoadd ips ${row.longitude} ${row.latitude} "${row.network}"`);
				//when buffer is filled then write it n empty buffer.
				if (buffer.length > BUFFER_SIZE) {
					redisPipe.stdin.write(buffer);
					buffer = '';
				}
			}
		})
		.on('end', async function () {
			redisPipe.stdin.write(buffer); //write the remaining buffer if any left
			redisPipe.stdin.end();
			console.log('Update complete');
			process.exit();
		});
}

function encodeRedis(dataString) {
	const dataArr = dataString.split(' '); //put data in array
	let msg = '*' + dataArr.length + '\r\n'; //create start of message with amount of args

	for (let i = 0; i < dataArr.length; i++) {
		msg += '$' + dataArr[i].length + '\r\n' + dataArr[i] + '\r\n'; //encode the data
	}
	return msg; //return the encoded message
}
module.exports = updateWithCLI;
// run();
