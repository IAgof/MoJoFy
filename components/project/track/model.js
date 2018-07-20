// components/project/track/model.js

const Modelate = require('modelate');
const modelUtil = require('../../../store/model-util');

const model = {
	trackIndex: {
		type: 'number'
	},
	volume: {
		type: 'number'
	},
	mute: {
		type: 'boolean'
	},
	position: {
		type: 'number'
	},
	compositionId: {
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
	// // TODO(jliarte): 10/07/18 store last modification from app?
	// lastModification: {
	// 	type: 'object',
	// 	date: true
	// },
	created_by: {
		type: 'string'
	}
};

const defaults = {
	trackIndex: 0,
	volume: 1,
	mute: false,
	position: 0,
	compositionId: '',
};

const  noDefaultsFields = ['created_by'];

const Model = new Modelate('Track').set(model);

function set(data) {
	return modelUtil.set(data, Model, defaults, noDefaultsFields);
}

module.exports = {
	model: model,
	_defaults: defaults,
	set: set
};
