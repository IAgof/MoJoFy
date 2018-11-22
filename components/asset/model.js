// components/asset/model.js

const Modelate = require('modelate');
const modelUtil = require('../../store/model-util');

const model = {
	name: {
		type: 'string'
	},
	type: {
		type: 'string'
	},
	hash: {
		type: 'string'
	},
	path: {
		type: 'string'
	},
	filename: {
		type: 'string'
	},
	mimetype: {
		type: 'string'
	},
	metadata: {
		type: 'object'
	},
	thumbnail: {
		type: 'string'
	},
	uri: {
		type: 'string'
	},
	projectId: {
		type: 'string',
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

const defaults = {
    name: '',
    projectId: '',
};

const noDefaultsFields = ['uri', 'thumbnail', 'path', 'filename', 'mimetype', 'metadata', 'type', 'hash', 'date',
	'created_by'];

const Model = new Modelate('Asset').set(model);

function set(data) {
    return modelUtil.set(data, Model, defaults, noDefaultsFields);
}

module.exports = {
	model: model,
    _defaults: defaults,
	set: set
};
