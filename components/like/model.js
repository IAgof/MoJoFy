
const Modelate = require('modelate');

const model = {
	from: {
		type: 'string'
	},
	entity: {
		type: 'string'
	},
	to: {
		type: 'string'
	}
};

const Model = new Modelate('Like').set(model);

function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
