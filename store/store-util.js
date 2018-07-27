function insertFilter(fieldName, operator, value, params) {
	if (!params.filters) {
		params.filters = [];
	}
	params.filters.push({
		field: fieldName,
		operator: operator,
		value: value
	});
}

module.exports = {
	insertFilter
};