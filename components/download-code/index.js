// const Model = require('./model');
const Store = require('./store');

exports.isValid = isValid;


// function add() {}

function getVideoCodes(id, callback) {

	if(!id) {
		callback(null, 'No video specified', 400);
	}

	var params = {
		filters: [{
			field: 'video', 
			operator: '=', 
			value: id
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

function isValid(video, code, callback) {
	getVideoCodes(video, function (data) {
		let result = [];

		if(data) {
			result = data.filter(function (elem) {
				return (elem.code === code);
			});
		}

		callback(result.length > 0);
	});
}
