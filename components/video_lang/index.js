const Model = require('./model');

const videoLangs = [
	Model.set({lang: 'es_es'}),
	Model.set({lang: 'en_en'}),
	Model.set({lang: 'es_gl'}),
	Model.set({lang: 'es_cat'}),
	Model.set({lang: 'es_'}),
	Model.set({lang: 'PIECE'})
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
