
var Modelate = require('modelate');

const model = {
	video: {
		type: 'string'
	},
	code: {
		type: 'string',
		length: {
			eq: 6
		}
	},
	added: {
		type: 'object',
		date: true
	},
	expires: {
		type: 'object',
		date: true
	},
	used: {
		type: 'number'
	}
};

const Model = new Modelate('DownloadCode').set(model);


function set(data) {
	return Model.modelate(data);
}


module.exports = {
	model: model,
	set: set
};
