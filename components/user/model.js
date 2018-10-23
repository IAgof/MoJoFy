
const Modelate = require('modelate');

const model = {
	// TODO(jliarte): 27/06/18 should we create indexes for this field?
	authId: {
		type: 'string',
	},
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
	verified: {
		type: 'boolean'
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
	prehisteric: {
		type: 'boolean'
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
