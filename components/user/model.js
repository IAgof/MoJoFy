
const Modelate = require('../../modelate');

const model = {
	// name: {
	// 	type: 'string',
	// 	maxLength: 12,
	// 	minLength: 1
	// },
	name: 'string',
	username: 'string',
	email: 'string',
	password: 'string',
	following: 'number',
	followers: 'number',
	verified: 'boolean',
	theme_options: 'object'
};

function set(data) {
	return new Modelate(data, model);
}


module.exports = {
	model: model,
	set: set
};
