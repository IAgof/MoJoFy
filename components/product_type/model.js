var Modelate = require('modelate');

const model = {
	productType: {
		type: 'string'
	},
};

const Model = new Modelate('ProductType').set(model);

function set(data) {
	return Model.modelate(data);
}

module.exports = {
	model: model,
	set: set
};
