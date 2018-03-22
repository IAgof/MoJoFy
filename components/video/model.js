
var Modelate = require('modelate');

const model = {
	owner: {
		type: 'string'
	},
	video: {
		type: 'string'
	},
	original: {
		type: 'string'
	},
	verified: {
		type: 'boolean'
	},
	poster: {
		type: 'string'
	},
	title: {
		type: 'string'
	},
	productType: {
		type: 'object'
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
	tag: {
		type: 'string'
	},
	length: {
		type: 'number'
	},
	size: {
		type: 'number'
	},
	format: {
		type: 'string'
	},
	dimensions: {
		type: 'string'
	},
	ratio: {
		type: 'string'
	},
	language: {
		type: 'string'
	},
	quality: {
		type: 'number'
	},
	credibility: {
		type: 'number'
	},
	date: {
		type: 'object',
		date: true
	}
};

const Model = new Modelate('Video').set(model);


function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
