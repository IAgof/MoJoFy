const Modelate = require('modelate');

const model = {
	name: {
		type: 'string'
	},
	location: {
		type: 'string'
	},
	date: {
		type: 'object',
		date: true
	},
	creation_date: {
		type: 'object',
		date: true
	},
	modification_date: {
		type: 'object',
		date: true
	},
	created_by: {
		type: 'string'
	}
};

const Model = new Modelate('Project').set(model);

function set(data) {
	return Model.modelate(data);
}

module.exports = {
	model: model,
	set: set
};
