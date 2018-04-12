const Model = require('./model');

const videoLangs = [
	Model.set({lang: 'es-es'}),
	Model.set({lang: 'en-en'}),
	Model.set({lang: 'gl-es'}),
	Model.set({lang: 'ca-es'}),
	Model.set({lang: 'eu-es'}),
	Model.set({lang: 'ambient'}),
	Model.set({lang: 'other'})
];

function list() {
// TODO(jliarte): harcoded by now, implement model retrieval when product types will be managed by admin
	return new Promise(resolve => {
		resolve(videoLangs);
	});
}

module.exports = {
	list
};
