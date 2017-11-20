
const crypto = require('crypto');
const fs = require('fs');

exports.hash = hash;
exports.verify = verify;


function hash(filePath, algorithm, callback) {

	console.log(filePath);

	if(typeof(algorithm) === 'function' && !callback) {
		callback = algorithm;
		algorithm = null;
	} else if(!callback || typeof(callback) !== 'function') {
		return false;
	}

	var hash = crypto.createHash(algorithm || 'sha256');
	var stream = fs.createReadStream(filePath);

	stream.on('data', function (data) {
		hash.update(data, 'utf8');
	});

	stream.on('end', function () {
		callback(hash.digest('hex'));
	});
}

function verify(filePath, hashToken, algorithm, callback) {
	
	if(typeof(algorithm) === 'function' && !callback) {
		callback = algorithm;
		algorithm = null;
	} else if(!callback || typeof(callback) !== 'function') {
		console.error('No callback defined');
		return false;
	}

	console.log(typeof algorithm);
	console.log(typeof callback);

	hash(filePath, algorithm, function(fileHash) {
		console.log(fileHash);
		callback(fileHash === hashToken);
	});
}

// verify('index.js', '9b55727a555587da92da551786e3897c', 'sha256', function(res) {
// 	console.log('callback executed: ' + res);
// });
