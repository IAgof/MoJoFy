var bcrypt = require('bcrypt');

const saltRounds = 10;

exports.crypt = function(pass, cb) {
	bcrypt.hash(pass, saltRounds, cb);
	return false;
};

exports.compare = function(pass, hash, cb) {
	bcrypt.compare(pass, hash, cb);
	return false;
};
