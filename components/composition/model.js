const Modelate = require('modelate');

const model = {
	uuid: {
		type: 'string'
	},
	title: {
		type: 'string'
	},
	description: {
		type: 'string'
	},
	lastModification: {
		type: 'string'
	},
	projectPath: {
		type: 'string'
	},
	quality: {
		type: 'string'
	},
	project: {
		type: 'string',
	},
	resolution: {
		type: 'string',
	},
	frameRate: {
		type: 'string',
	},
	duration: {
		type: 'integer'
	},
	pathLastVideoExported: {
		type: 'string'
	},
	dateLastVideoExported: {
		type: 'string'
	},
	isAudioFadeTransitionActivated: {
		type: 'boolean'
	},
	isVideoFadeTransitionActivated: {
		type: 'boolean'
	},
	isWatermarkActivated: {
		type: 'boolean'
	},
// public RealmList<RealmVideo> videos;
// public RealmList<RealmMusic> musics;
// public RealmList<RealmTrack> tracks;
	productType {
		type: 'string'
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

const Model = new Modelate('Composition').set(model);

function set(data) {
	return Model.modelate(data);
}

module.exports = {
	model: model,
	set: set
};
