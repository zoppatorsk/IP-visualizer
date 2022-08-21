import { spawn } from 'child_process';
import { createReadStream } from 'fs';
import CsvReadableStream from 'csv-reader';

const uri = process.env.REDIS_CONNECT_STRING;
const redisPipe = spawn(`redis-cli`, ['-u', `${uri}`, '--pipe']);

redisPipe.on('error', function (err) {
	console.log('Failed spawning redis-cli, check your REDIS_CONNECT_STRING in .env or try slow loading instead');
	process.exit();
});

redisPipe.stdout.setEncoding('utf8');
redisPipe.stdout.pipe(process.stdout);
redisPipe.stderr.pipe(process.stderr);

const BUFFER_SIZE = 524288; // 512KB
let buffer = '';

async function updateWithCLI(file) {
	let inputStream = createReadStream(file, 'utf8');
	console.log('Pleas wait...');

	inputStream
		.pipe(new CsvReadableStream({ asObject: true }))
		.on('data', async function (row) {
			if (row.longitude && row.latitude) {
				buffer += encodeRedis(`geoadd ips ${row.longitude} ${row.latitude} ${row.network}`);
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
export default updateWithCLI;
