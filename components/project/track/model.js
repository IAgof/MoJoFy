// components/project/track/model.js

const Modelate = require('modelate');

const model = {
// TODO/FIXME(jliarte): 10/07/18 needed while datastore store does not support string IDs (do for other project/composition models!)
	uuid:  {
		type: 'string'
	},
	trackId: {
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
	//    public RealmList<RealmVideo> videos;
	//    public RealmList<RealmMusic> musics;
};

const Model = new Modelate('Track').set(model);

function set(data) {
	return Model.modelate(data);
}

module.exports = {
	model: model,
	set: set
};
