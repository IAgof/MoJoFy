
const Modelate = require('modelate');

const model = {
	owner: {
		type: 'string'
	},
	url: {
		type: 'string'
	},
	// location: {
	// 	type: 'object'
	// },
	date: {
		type: 'object'
	},
	hash: {
		type: 'string'
	}
};

const Model = Modelate('File').set(model);

function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
