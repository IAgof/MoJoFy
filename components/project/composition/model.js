// components/project/composition/model.js

const Modelate = require('modelate');
const modelUtil = require('../../../store/model-util');

const model = {
	title: {
		type: 'string'
	},
	description: {
		type: 'string'
	},
	remoteProjectPath: {
		type: 'string'
	},
	quality: {
		type: 'string'
	},
	resolution: {
		type: 'string'
	},
	frameRate: {
		type: 'string'
	},
	duration: {
		type: 'number'
	},
	// pathLastVideoExported:
	// dateLastVideoExported:
	audioFadeTransitionActivated: {
		type: 'boolean'
	},
	videoFadeTransitionActivated: {
		type: 'boolean'
	},
	watermarkActivated: {
		type: 'boolean'
	},
	productType: {
		type: 'string'
	},
	poster: {
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
	// // TODO(jliarte): 10/07/18 store last modification from app?
	// lastModification: {
	// 	type: 'object',
	// 	date: true
	// },
	created_by: {
		type: 'string'
	}
	// public RealmList<RealmTrack> tracks;
	//    public RealmList<RealmVideo> videos;
	//    public RealmList<RealmMusic> musics;
};


const defaults = {
	title: '',
	description: '',
	remoteProjectPath: '',
	quality: '',
	resolution: '',
	frameRate: '',
	duration: 0,
	audioFadeTransitionActivated: false,
	videoFadeTransitionActivated: false,
	watermarkActivated: false,
	productType: '',
	poster: '',
	projectId: '', // TODO(jliarte): 14/07/18 set or not?
	// date: {
	// 	type: 'object',
	// 	date: true
	// },
};

const  noDefaultsFields = ['created_by'];

const Model = new Modelate('Composition').set(model);

function set(data) {
	return modelUtil.set(data, Model, defaults, noDefaultsFields);
}

module.exports = {
	model: model,
	_defaults: defaults,
	set: set
};
