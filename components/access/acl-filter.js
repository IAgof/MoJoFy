const defaultFilteredFields = ['modification_date', 'creation_date'];

function filterItem(item, filteredFields) {
	for (let id in filteredFields) {
		delete item[filteredFields[id]];
	}
	return item;
}

exports.getFilterFunction = function (filteredFields) {
	if (filteredFields === undefined) {
		filteredFields = defaultFilteredFields;
	}
	return function(data) {
		if (data.length !== undefined) {
			return data.map(item => filterItem(item, filteredFields));
		} else {
			return filterItem(data, filteredFields);
		}
	};
};

