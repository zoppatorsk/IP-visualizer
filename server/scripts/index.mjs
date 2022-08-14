//rewrote scripts using ESM modules instead of CommonJS as fixed version of download package is not currently available as ESM module.

import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' }); //just for testing
//dotenv.config({ path: '../.env' });
import { pathExists, ensureDir, move, remove } from 'fs-extra';
import { readdirSync } from 'fs';
import download from 'download';
import readlineSync from 'readline-sync';

const url = 'https://geoip.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&suffix=zip&license_key=' + process.env.MAXMIND_KEY;
const destPath = './files/temp';
const dataFile = './files/GeoLite2-City-Blocks-IPv4.csv';

async function run() {
	//check if file exist.
	const fileExist = await pathExists(dataFile);

	//if file does not exist then download it.
	if (!fileExist) {
		//create temp folder if needed
		await ensureDir(destPath);
		console.log('Needed file does not exist, will download it');
		await download(url, destPath, { extract: true }).catch((err) => {
			console.log('Download failed :', err.message);
			process.exit(1);
		});

		//read directories as directory name changes depening on download date.
		const directories = readdirSync(destPath);

		//move the file we need to the files folder
		const filename = dataFile.split('/').pop();
		await move(`${destPath}/${directories[0]}/${filename}`, `${dataFile}`);

		//remove the temp directory with the rest of the files that we dont need
		await remove(`${destPath}/`);

		console.log('download done');
	} else console.log('File already exist, will not download it');

	//choose what to do
	readlineSync.setDefaultOptions({ limit: ['r', 'p'] });
	const answer = readlineSync.question('Bulkload with redis-cli. Parse to text file. Quit. r/p/q: ');
	if (answer === 'r') {
		const { default: updateWithCLI } = await import('./updateWithCLI.mjs');
		updateWithCLI(dataFile);
	} else if (answer === 'p') {
		const { default: writeFile } = await import('./writeFile.mjs');
		writeFile(dataFile);
	} else if (answer === 'q') {
		process.exit(0);
	}
}
run();
