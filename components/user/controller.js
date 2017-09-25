
const Acl = require('./acl');

exports.get = function(id, token, callback) {
	if(Number(id) === 1234) {
		callback({user: id, name: 'Good question', bio: 'This data is hardcoded'}, null);
	} else {
		callback(null, 'That user does not exist', 404);
	}
};

exports.list = function(token, callback) {

	Acl.query(token, 'list', function(success) {

		if(success) {
			callback([{user: 1234, name: 'Good question', bio: 'This data is hardcoded'}, {user: 1235, name: 'aGoodUser', bio: 'Yap. This user is also hardcoded...'}], null);
		} else {
			callback(null, 'You can\'t list users.', 403);
		}
	});

};