//super simple logging module
const fs = require('fs');

//log uncaught exception errrors and unhandled promise rejections
process
	.on('unhandledRejection', (reason, p) => {
		console.error(reason, 'Unhandled promise rejection ', p);
		//cant figure out how to log the promise rejection properly so just logging the reason
		logError(reason);
		process.exit(1); //just kill on rejection.. shouldnt be a problem
	})
	.on('uncaughtException', (err) => {
		console.error('Uncaught Exception', err);
		logError(err.stack ? err.stack : err);
		process.exit(1);
	});

function logError(content) {
	const logContent = '\r\n\r\n' + new Date() + '\r\n' + content; //add date n time
	try {
		fs.appendFileSync('error.log', logContent);
	} catch (err) {
		console.error('Could not write to logfile! ', err);
	}
}
module.exports = logError;
//
