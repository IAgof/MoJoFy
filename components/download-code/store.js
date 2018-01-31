const Persistent = require('../../store/datastore');

const type = 'download_code';


exports.query = query;


function query(params, callback) {
	Persistent.query(type, params, function(data) {
		callback(data);
	});
}