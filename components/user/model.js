
const Modelate = require('modelate');

const model = {
	name: {
		type: 'string',
		length: {
			min: 1,
			max: 100
		}
	},
	username: {
		type: 'string',
		length: {
			min: 1,
			max: 32
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
		type: 'string',
		typeStrict: true	// Avoid type parsing
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
	},
	pic: {
		type: 'string',
		typeStrict: true
	},
	updated_at: {
		type: 'object',
		date: true
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
