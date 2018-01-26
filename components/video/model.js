
var Modelate = require('modelate');

const model = {
	owner: {
		type: 'string'
	},
	video: {
		type: 'string'
	},
	poster: {
		type: 'string'
	},
	title: {
		type: 'string'
	},
	description: {
		type: 'string'
	},
	hash: {
		type: 'string'
	},
	original_name: {
		type: 'string'
	},
	metadata: {
		type: 'object'
	},
	likes: {
		type: 'number'
	},
	liked: {
		type: 'object'
	},
	date: {
		type: 'object'
	}
};

const Model = Modelate('Video').set(model);


function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
