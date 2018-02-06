const Model = require('./model');
const Store = require('./store');

// Define a maximum number of codes that can a single request generate.
const MAX_CODES_PER_REQUEST = 50;

exports.add = addCodes;
exports.isValid = isValid;

function addCodes(videoId, codes, callback) {
	if(!videoId) {
		callback(null, 'No video specified', 400);
	}

	const count = isNaN(Number(codes)) ? 0 : Number(codes);

	if(!codes || codes > MAX_CODES_PER_REQUEST) {
		callback(null, 'Impossible to generate that ammount of download codes', 400);
		return false;
	}

	const generated = [];

	for (var i = 0; i < count; i++) {
		// const code = new Model.set()
		const code = {
			video: videoId,
			code: Math.random().toString(36).substr(2, 6),
			added: new Date(),
			used: 0
		};

		const model = Model.set(code);
		Store.upsert(model, addedCode);
	}

	function addedCode(result) {
		if(!result) {
			callback(null, 'Error generating download codes', 500);
			return false;
		}
		generated.push(result);

		if(generated.length === count) {
			callback(generated.length, null);
		}
	}
}

function getVideoCodes(videoId, callback) {
	if(!video) {
		callback(null, 'No video specified', 400);
	}

	var params = {
		filters: [{
			field: 'video', 
			operator: '=', 
			value: videoId
		}]
	};

	Store.query(params, function(list) {
		if(list && list.length > 0) {
			callback(list, null);
		} else {
			callback(null, 'That video does not have any code', 404);
		}
	});
}

function isValid(videoId, code, callback) {
	getVideoCodes(videoId, function (data) {
		let result = [];

		if(data) {
			result = data.filter(function (elem) {
				return (elem.code === code);
			});
		}

		callback(result.length > 0);
	});
}
