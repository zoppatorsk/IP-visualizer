require('dotenv').config({ path: '../.env' });
const fse = require('fs-extra');
const download = require('download');
const readlineSync = require('readline-sync');
const url = 'https://geoip.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&suffix=zip&license_key=' + process.env.MAXMIND_KEY;
const destPath = './files/temp';
const dataFile = './files/GeoLite2-City-Blocks-IPv4.csv';

async function run() {
	//logic

	//check if file exist.
	const fileExist = await fse.pathExists(dataFile);

	//if file does not exist then download it.
	if (!fileExist) {
		//create temp folder if needed
		await fse.ensureDir(destPath);
		console.log('Needed file does not exist, will download it');
		await download(url, destPath, { extract: true });

		//read directories as directory name changes depening on download date.
		const directories = fse.readdirSync(destPath);

		//move the file we need to the files folder
		const filename = dataFile.split('/').pop();
		await fse.move(`${destPath}/${directories[0]}/${filename}`, `${dataFile}`);

		//remove the tenp directory with the rest of the files that we dont need
		fse.removeSync(`${destPath}/`);

		console.log('download done');
	} else console.log('File already exist, will not download it');

	//choose what to do
	readlineSync.setDefaultOptions({ limit: ['r', 'p'] });
	const answer = readlineSync.question('Bulkload with redis-cli or just Parse to text file? r/p: ');
	if (answer === 'r') {
		const updateWithCLI = require('./updateWithCLI');
		updateWithCLI(dataFile);
	} else if (answer === 'p') {
		const writeFile = require('./writeFile');
		writeFile(dataFile);
	}
}
run();
