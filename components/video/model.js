
const Modelate = require('../../modelate');

const model = {
	// name: {
	// 	type: 'string',
	// 	maxLength: 12,
	// 	minLength: 1
	// },
	owner: 'string',
	video: 'string',
	poster: 'string',
	title: 'string',
	description: 'string',
	hash: 'string',
	original_name: 'string',
	metadata: 'object',
	likes: 'number',
	liked: 'object',
	date: 'object'
};

function set(data) {
	return new Modelate(data, model);
}


module.exports = {
	model: model,
	set: set
};
