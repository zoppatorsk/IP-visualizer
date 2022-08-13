import { createReadStream, createWriteStream } from 'fs';
import CsvReadableStream from 'csv-reader';
const outPutFile = './files/parsed.txt';

function writeFile(inputFile) {
	console.log('Parsing csv file');

	let inputStream = createReadStream(`${inputFile}`, 'utf8');
	let outputStream = createWriteStream(`${outPutFile}`);
	inputStream
		.pipe(new CsvReadableStream({ asObject: true }))
		.on('data', async function (row) {
			if (row.longitude && row.latitude) {
				outputStream.write(`geoadd ips ${row.longitude} ${row.latitude} ${row.network}\r\n`);
			}
		})
		.on('end', async function () {
			outputStream.end();
			console.log('Parse complete');
			console.log(`Output file: ${outPutFile}`);
			process.exit();
		});
}
export default writeFile;
