
const Modelate = require('../../modelate');

const model = {
	// name: {
	// 	type: 'string',
	// 	maxLength: 12,
	// 	minLength: 1
	// },
	title: 'string',
	description: 'string',
	icon: 'string',
	creator: 'string',
	unlocked: 'number',
	requested: 'number',
	isLocked: 'boolean'
};

function set(data) {
	return new Modelate(data, model);
}


module.exports = {
	model: model,
	set: set
};
