const Modelate = require('modelate');

const model = {
	user: {
		type: 'string',
	},
	video: {
		type: 'string',
	},
	client: {
		type: 'string',
	},
	client_name: {
		type: 'string',
	},
	date: {
		type: 'object',
		date: true,
	},
};

const Model = new Modelate('Distribute').set(model);

function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
