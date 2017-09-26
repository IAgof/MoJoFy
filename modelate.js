const util = require('./util');

var Modelate = function(data, model) {

	const obj = util.clone(model);

	for(let prop in obj) {
		if(typeof(data[prop]) === model[prop]) {
			obj[prop] = data[prop];
		} else {
			delete obj[prop];
		}
	}

	return obj;
};


module.exports = Modelate;
