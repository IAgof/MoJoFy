// const Model = require('./model');
const Store = require('./store');

exports.isValid = isValid;


// function add() {}

function getVideoCode(id, callback) {

	if(!id) {
		callback(null, 'No video specified', 400);
	}

	var params = {
		filters: [{
			field: 'video', 
			operator: '=', 
			value: id
		}],
		limit: 1
	};

	Store.query(params, function(list) {
		if(list && list.length > 0) {
			callback(list[0], null);
		} else {
			callback(null, 'That video does not have any code', 404);
		}
	});
}

function isValid(video, code, callback) {
	getVideoCode(video, function (data) {
		if(data && data.code === code) {
			callback(true);
		} else {
			callback(false);
		}
	});
}
