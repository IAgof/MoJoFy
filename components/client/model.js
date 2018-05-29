
const Modelate = require('modelate');

const model = {
	name: {
		type: 'string',
		length: {
			min: 1,
			max: 32
		}
	},
	ftp: {
		type: 'object',
	}
};

const Model = new Modelate('Client').set(model);

function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
