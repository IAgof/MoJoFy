
const Modelate = require('modelate');

const model = {
	name: {
		type: 'string',
		length: {
			min: 1,
			max: 32
		}
	},
	username: {
		type: 'string',
		length: {
			min: 1,
			max: 12
		}
	},
	email: {
		type: 'string',
		length: {
			min: 5,
			max: 60
		}
	},
	password: {
		type: 'string'
	},
	following: {
		type: 'number'
	},
	followers: {
		type: 'number'
	},
	verified: {
		type: 'boolean'
	},
	theme_options: {
		type: 'object'
	},
	videoCount: {
		type: 'number'
	},
	role: {
		type: 'string'
	}
};

const Model = new Modelate('User').set(model);

function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
