
const Modelate = require('../../modelate');

const model = {
	// name: {
	// 	type: 'string',
	// 	maxLength: 12,
	// 	minLength: 1
	// },
	from: 'string',
	entity: 'string',
	to: 'string'
};

function set(data) {
	return new Modelate(data, model);
}


module.exports = {
	model: model,
	set: set
};
