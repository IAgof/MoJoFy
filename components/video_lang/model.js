var Modelate = require('modelate');

const model = {
	lang: {
		type: 'string'
	},
};

const Model = new Modelate('VideoLang').set(model);

function set(data) {
	return Model.modelate(data);
}

module.exports = {
	model: model,
	set: set
};
