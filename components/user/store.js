
const Persistent = require('../../store/datastore');
// const Cache = require('../../store/redis');

exports.get = get;

function get(id, callback) {

	// Cache.get('user', id, function(data) {
	// 	if(!data) {
			Persistent.get('user', id, function(data) {
				callback(data);
			});
	// 	} else {
	// 		callback(data);
	// 	}
	// });
}
