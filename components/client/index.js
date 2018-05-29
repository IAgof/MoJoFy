const model = require('./model');
const Store = require('./store');
const logger = require('../../logger');

exports.list = list;
exports.add = add;
exports.update = update;
exports.get = get;

/**
 */
/**
 *	Get a list of clients
 *	@param {object}	params	(optional) Params to use for querying clients
 *	@param {function}	callback Return an array on success, null on error.
 */
function list(params, callback) {
	if (typeof params === 'function') {
		callback = params;
		params = {};
	}
	// If there's not callback, result will not be used, so we go out the function
	if (typeof callback !== 'function') {
		logger.debug((typeof callback === 'undefined' ? 'No callback specified' : 'Invalid type "'+ typeof callback +'" for callback') +' in "client.list" function. Skipping.');
		return false;
	}

	Store.list({}, function(data) {
		let err = null;
		if(!data) {
			logger.debug('Database client list error.');
			err = 'Error listing clients from database';
		}

		typeof callback === 'function' && callback(data, err);
	});
}

/**
 */
/**
 *	Add a new client
 *	@param {object} data Data for th client to add
 *	@param {function} callback Return the data added if success, null if error.
 */
function add(data, callback) {
	// If there's not callback, result will not be used, so we go out the function
	if (typeof callback !== 'function') {
		logger.debug((typeof callback === 'undefined' ? 'No callback specified' : 'Invalid type "'+ typeof callback +'" for callback') +' in "client.list" function. Skipping.');
		return false;
	} else if (!data) {
		logger.debug('No data specified in "client.add" function. Skipping.');
		callback(null, 'No data specified', 400);
		return false;
	}

	const safeData = model.set(data);
	if(!safeData.name || !safeData.ftp) {
		logger.debug('Invalid data modelated for "client.add" function:');
		logger.debug(safeData);
		logger.debug('Skipping "client.add".');
		callback(null, 'Invalid data specified', 400);
		return false;
	}

	Store.upsert(data, function (result, id) {
		safeData._id = id || null;

		let resp = safeData;
		let err = null;
		
		if(!result) {
			logger.debug('Database client upsert error (in update function).');
			err = 'Unable to update client in database';
			resp = null;
		}

		typeof callback === 'function' && callback(resp, err);
	});
}

/**
 */
/**
 *	Update a client
 *	@param {object}	data	Params to use for querying clients
 *	@param {string}	id		(optional) ID to use. This will have preference over data._id
 *	@param {function}	callback Return the data updated if success, null if error.
 */
function update(data, id, callback) {
	if (typeof id === 'function') {
		callback = id;
		id = null;
	}
	// If there's not callback, result will not be used, so we go out the function
	if (typeof callback !== 'function') {
		logger.debug((typeof callback === 'undefined' ? 'No callback specified' : 'Invalid type "'+ typeof callback +'" for callback') +' in "client.list" function. Skipping.');
		return false;
	}

	if (id === null) {
		id = data._id || null;
	}

	const safeData = model.set(data);
	safeData._id = id;

	Store.upsert(safeData, function (result, id) {
		let resp = safeData;
		let err = null;
		
		if(!result) {
			logger.debug('Database client upsert error (in update function).');
			err = 'Unable to update client in database';
			resp = null;
		}

		typeof callback === 'function' && callback(resp, err);
	});
}

/**
 */
/**
 *	Get a client by id
 *	@param {string}	id	ID to find client
 *	@param {function}	callback Return a client object on success, null on error.
 */
function get(id, callback) {
	// If there's not callback, result will not be used, so we go out the function
	if (typeof callback !== 'function') {
		logger.debug((typeof callback === 'undefined' ? 'No callback specified' : 'Invalid type "'+ typeof callback +'" for callback') +' in "client.get" function. Skipping.');
		return false;
	} else if (typeof id === 'undefined' || id === null) {
		logger.debug('No id specified in "client.get" function. Skipping.');
		return false;
	}

	Store.get(id, function (data) {
		let err = null;
		let code = 200;
		if(!data) {
			logger.debug('Database client get error.');
			err = 'Unable to find client in database';
			code = 404;
		} else {
			data._id = id;
		}

		typeof callback === 'function' && callback(data, err, code);
	});
}
