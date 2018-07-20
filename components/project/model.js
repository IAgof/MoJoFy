// components/project/model.js

const Modelate = require('modelate');
const modelUtil = require('../../store/model-util');

const model = {
	name: {
		type: 'string'
	},
	location: {
		type: 'string'
	},
	date: {
		type: 'object',
		date: true
	},
	poster: {
		type: 'string'
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
	location: '',
	poster: ''
};

const noDefaultsFields = ['created_by'];

const Model = new Modelate('Project').set(model);

function set(data) {
	return modelUtil.set(data, Model, defaults, noDefaultsFields);
}

module.exports = {
	model: model,
	_defaults: defaults,
	set: set
};
