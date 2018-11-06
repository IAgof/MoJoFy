// components/user/user-feature/model.js

const Modelate = require('modelate');
const modelUtil = require('../../../store/model-util');

const model = {
	name: {
		type: 'string'
	},
	description: {
		type: 'string'
	},
	enabled: {
		type: 'boolean'
	},
	creation_date: {
		type: 'object',
		date: true
	},
	modification_date: {
		type: 'object',
		date: true
	},
	userId: {
		type: 'string'
	},
	plan: {
		type: 'string'
	}
};

const defaults = {
    description: '',
    enabled: false,
};

const noDefaultsFields = ['name', 'userId', 'plan'];

const Model = new Modelate('UserFeature').set(model);

function set(data) {
    return modelUtil.set(data, Model, defaults, noDefaultsFields);
}

module.exports = {
	model: model,
    _defaults: defaults,
	set: set
};
