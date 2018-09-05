// components/user/user-feature/acl.js

const logger = require('../../../logger')(module);

const getUser = require("../../access/acl").getUser;
const Response = require('../../../network/response');

exports.middleware = function(req, res, next) {
	if (!getUser(req)) {
		// Check if user have a Token
		Response.error(req, res, next, 401, 'Unauthenticated'); // TODO(jliarte): 31/08/18 change to throw error?
		return false;
	} else {
		next();
	}
	return false;
};

const filteredFields = ['modification_date', 'creation_date', 'userId', '_id'];

// TODO(jliarte): 5/09/18 extract these two functions to an acl exported function?
function filterItem(item, filteredFields) {
	for (let id in filteredFields) {
		delete item[filteredFields[id]];
	}
	return item;
}

exports.filter = function(data) {
	if (data.length != undefined) {
		return data.map(item => filterItem(item, filteredFields));
	} else {
		return filterItem(data, filteredFields);
	}
};
