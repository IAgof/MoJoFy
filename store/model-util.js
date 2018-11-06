function unsetField(data, field, composition) {
	if (!data.hasOwnProperty(field)) {
		delete composition[field];
	}
}

function set(data, Model, defaults, noDefaultsFields) {
	let entity = Object.assign({}, data);
	for (let key in defaults) {
		if (!entity.hasOwnProperty(key)) {
			entity[key] = defaults[key];
		}
	}
	entity = Model.modelate(entity);
	// (jliarte): 14/07/18 remove invented fields with no default values
	for (let id in noDefaultsFields) {
		unsetField(data, noDefaultsFields[id], entity);
	}
	return entity;
}


module.exports = {
	unsetField,
	set,
};