
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
	published: {
		type: 'boolean'
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
		type: 'string'
	},
	categories: {
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
	},
	featured: {
		type: 'boolean'
    },
	priceStd: {
		type: 'number'
	},
	priceCountry: {
		type: 'number'
	},
	priceContinent: {
		type: 'number'
	},
	priceWorld: {
		type: 'number'
	},
	notes: {
		type: 'string'
	},
	locationName: {
		type: 'string'
	},
	location: {
		type: 'object'
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
