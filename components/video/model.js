
const Modelate = require('../../modelate');

const model = {
	// name: {
	// 	type: 'string',
	// 	maxLength: 12,
	// 	minLength: 1
	// },
	owner: 'string',
	url: 'string',
	location: 'string',
	date: 'object'
};

function set(data) {
	return new Modelate(data, model);
}


module.exports = {
	model: model,
	set: set
};
