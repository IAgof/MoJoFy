var Modelate = require('modelate');

const model = {
	category: {
		type: 'string'
	},
};

const Model = new Modelate('VideoCategory').set(model);

function set(data) {
	return Model.modelate(data);
}

module.exports = {
	model: model,
	set: set
};
