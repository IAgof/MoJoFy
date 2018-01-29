
const Modelate = require('modelate');

const model = {
	title: {
		type: 'string',
		length: {
			min: 1,
			max: 64
		}
	},
	description: {
		type: 'string'
	},
	icon: {
		type: 'string'
	},
	creator: {
		type: 'string'
	},
	unlocked: {
		type: 'number'
	},
	requested: {
		type: 'number'
	},
	isLocked: {
		type: 'boolean'
	}
};

const Model = new Modelate('Achievement').set(model);

function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
