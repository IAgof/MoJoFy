const client = require('../client');
const video = require('../video');
const ftp = require('../ftp');

const Model = require('./model');
const Store = require('./store');
const logger = require('../../logger');


/* Exported interface */
exports.add = distribute;
exports.get = getVideoDistribution;


/* Internal functions */

/**	distributeCallback
 *	@param {object}	data	Result of distribution, or null on error
 *	@param {string}	error	Error message, or null on success
 *	@param {number}	status	Error code using HTTP Status codes
 */
/** distribute
 *	Send a video to a client, optionally defining a method.
 *
 *	@param {string} uid			ID of the user executing distribution
 *	@param {string} clientId	ID of client to distribute
 *	@param {string} videoId		ID of video to distribute
 *	@param {string}	method	(optional) 	Method to distribute (for now, FTP)
 *	@param {distributeCallback} callback	Function to execute on success or error
 *	@returns {void}
 */
function distribute(uid, clientId, videoId, method, callback) {
	if (!uid || !clientId || !videoId) {
		(typeof callback === 'function') && callback(null, 'Undefined client or video', 400);
		return false;
	}

	if(typeof method === 'function') {
		callback = method;
		method = 'ftp';
	}

	let res = 0;
	let clientData = null;
	let videoData = null;
 
	client.get(clientId, function (data, err) {
		if (err) {
			(typeof callback === 'function') && callback(null, 'Unable to find client', 500);
			return false;
		}

		clientData = data;
		if (++res === 2) {
			executeDistribution(uid, clientData, videoData, method, callback); 	
		} 
	});

	video.get(videoId, function (data, err) {
		if (err) {
			(typeof callback === 'function') && callback(null, 'Unable to find video', 500);
			return false;
		}

		videoData = data;
		if (++res === 2) {
			executeDistribution(uid, clientData, videoData, method, callback); 	
		} 
	});
}

/** getVideoDistribution
 *	
 *	@param {string}	videoId	ID of the video to get distribution info
 *	@param {function}	callback	Function to execute on success or error
 */
function getVideoDistribution(videoId, callback) {
	if(typeof callback !== 'function') {
		logger.debug((typeof callback === 'undefined' ? 'No callback specified' : 'Invalid type "'+ typeof callback +'" for callback') +' in "distribute.getVideoDistribution" function. Skipping.');
		return false;
	} else if (typeof videoId === 'undefined') {
		logger.debug('Undeined videoId in "distribute.getVideoDistribution" function. Skipping.');
		callback(null, 'Invalid video to get distribuition info', 400);
		return false;
	}

	const params = {
		filter: [{
			field: 'video',
			operator: '=',
			value: videoId
		}]
	};

	Store.list(params, function (data) {
		let err = null;
		let code = 200;

		if (data === null) {
			err = 'Unable to find distribution for that video';
			code = 404;
		}

		callback(data, err, code);
	});
}

/** [internal] executeDistribution
 * 	Execute the distribution having a full client and video data. As is thought
 *	to be called internally, all params are mandatory.
 *
 *	@param {string} uid		ID of the user executing distribution
 *	@param {object} client	Client to distribute
 *	@param {object} video	Video to distribute
 *	@param {string}	method	Method to distribute (for now, only FTP)
 *	@param {distributeCallback} callback	Function to execute on success or error
 *	@returns {void}
 */
function executeDistribution(uid, client, video, method, callback) {
	if (typeof client[method.toLowerCase()] === 'undefined') {
		(typeof callback === 'function') && callback(null, 'Distribution method not configured for that client', 400);
		return false;
	}


	switch (method) {
		case 'ftp':
			sendToFtp(uid, client, video, callback);
			break;

		default:
			console.warn('Unable to distribute in that method');
			(typeof callback === 'function') && callback(null, 'Unable to distribute in that method', 400);
			break;
	}
}

/** [internal] sendToFtp
 *	Send a video using FTP component.
 *	
 *	@param {string} uid		ID of the user executing distribution
 *	@param {object} client	Client to distribute
 *	@param {object} video	Video to distribute
 *	@param {distributeCallback} callback	Function to execute on success or error
 */
function sendToFtp(uid, client, video, callback) {
	ftp.send(client.ftp, video.video, function (res) {
		if (res === false) {
			(typeof callback === 'function') && callback(null, 'Error moving the file to the FTP server', 500);
			return false;
		}

		var distribution = Model.set({
			user: uid,
			video: video._id,
			client: client._id,
			client_name: client.name,
			date: new Date(),
		});

		Store.upsert(distribution, function () { 
			(typeof callback === 'function') && callback(distribution);
		});

	});
}
