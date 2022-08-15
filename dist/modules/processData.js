module.exports = function processData(data) {
	function calculateHosts(ip) {
		return Math.pow(2, 32 - parseInt(ip.split('/')[1]));
	}

	let compiled = [];
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		compiled.push({
			CIDR: item[0],
			hosts: calculateHosts(item[0]),
			coordinates: [parseFloat(item[1][0]), parseFloat(item[1][1])],
		});
	}
	return compiled;
};
