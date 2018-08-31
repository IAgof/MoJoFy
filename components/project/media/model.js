// components/project/media/model.js

const Modelate = require('modelate');
const modelUtil = require('../../../store/model-util');

const model = {
	mediaType: {
		type: 'string'
	},
	position: {
		type: 'number'
	},
	mediaPath: {
		type: 'string'
	},
	volume: {
		type: 'number'
	},
	remoteTempPath: {
		type: 'string'
	},
	clipText: {
		type: 'string'
	},
	clipTextPosition: {
		type: 'string'
	},
	hasText: {
		type: 'boolean'
	},
	trimmed: {
		type: 'boolean'
	},
	startTime: {
		type: 'number'
	},
	stopTime: {
		type: 'number'
	},
	videoError: {
		type: 'string'
	},
	transcodeFinished: {
		type: 'boolean'
	},
	trackId: {
		type: 'string',
	},
    assetId: {
		type: 'string',
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
	mediaType: 'video',
	position: 0,
	mediaPath: '',
	volume: 1,
	clipText: '',
	clipTextPosition: '',
	hasText: false,
	trimmed: false,
	startTime: 0,
	// stopTime: ???
	videoError: '',
	trackId: '', // TODO(jliarte): 14/07/18 set or not?
	// date: {
	// 	type: 'object',
	// 	date: true
	// },
};

const  noDefaultsFields = ['stopTime', 'transcodeFinished', 'remoteTempPath', 'assetId', 'created_by'];

const Model = new Modelate('Media').set(model);

function set(data) {
	return modelUtil.set(data, Model, defaults, noDefaultsFields);
}

module.exports = {
	model: model,
	_defaults: defaults,
	set: set
};
