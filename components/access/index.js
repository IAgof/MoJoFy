
const Acl = require('./acl');
const Pass = require('./password');
const User = require('../user');

// Exposed functions

exports.login = login;


// Internal functions

function login(data, token, callback) {

	const params = {
		filters: [],
		limit: 1
	};

	if(!data.password) {
		callback(null, 'Unable to login, no password provided', 400);
		return false;
	}

	if(typeof data.name === 'string') {
		params.filters.push({
			field: 'name', 
			operator: '=', 
			value: data.name
		});
	} else if(typeof data.email === 'string') {
		params.filters.push({
			field: 'email', 
			operator: '=', 
			value: data.email
		});
	} else {
		callback(null, 'Unable to login, no user provided', 400);
		return false;
	}


	User.query(params, token, function(users) {
		if(!users || users.length === 0) {
			callback(null, 'Unable to find user', 404);
			return false;
		}

		Pass.compare(data.password, users[0].password, function(err, res) {
			if(err) {
				console.error(err);
				callback(null, 'Error checking password', 500);
			} else if(res === true) {
				delete users[0].password;
				users[0].token = Acl.token(users[0]);
				callback(users[0], null);
			} else {
				callback(null, 'Password does not match', 401);
			}
		});

	}, true);
}
