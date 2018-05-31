const ftp = require("basic-ftp");
const mime = require('mime');

const fs = require("fs");

const http = require("http");
const https = require("https");

/* Methods interface */

exports.send = send;


/* Internal functions */

/** send
 * 	Get a file from a given URI and sends to FTP
 *
 *	@param {object} ftpData	Object with FTP connection info (host, user, password and secure).
 *	@param {string} fileUri
 *	@returns {void}
 */
function send(ftpData, fileUri, callback) {
	const fileName = fileUri.split('/').pop();
	if (fileUri.indexOf('http://') === 0 || fileUri.indexOf('https://') === 0) {
		// Is an URL
		downloadPipe(fileUri, function(file) {
			ftpUpload(ftpData, file, fileName, callback);
		});
	} else {
		// Is a local file 
		ftpUpload(ftpData, fs.createReadStream(fileUri), fileName, callback);
	}
}

/** [internal] downloadPipe
 *	Create a stream from a file located in a HTTP(s) location
 *
 *	@param {string} url	URL with location of file.
 *	@param {callback} callback Same than any http.get callback. 
 *	@see https://nodejs.org/api/http.html#http_class_http_agent
 *	@returns {void}
 */
function downloadPipe(url, callback) {
	const splitUrl = url.split('/');
	const filename = splitUrl[splitUrl.length - 1];
	const type = mime.getType(filename);

	let transport = url.startsWith('https') ? https : http;
	
	transport.get(url, callback);
}

/** [internal] ftpUpload
 *	Upload a file stream to an ftp client given its data
 *
 *	@param {object} ftpData	Object with FTP connection info (host, user, password and secure).
 *	@param {stream} file	A file stream to upload to the FTP client.
 *	@returns {Promise} Promise with the result of the async function.
 */
function ftpUpload(ftpData, file, fileName, callback) {
	const client = new ftp.Client();
	
	client.access({
		host: ftpData.host,
		user: ftpData.user,	
		password: ftpData.password,
		secure: ftpData.secure || false
	}).then(function () {
		// TO-DO: check naming video since this rewrite what you have uploaded every time
		return client.upload(file, fileName);
	}).then(function () {
		client.close();
		callback(true, null);
	}).catch(function (err) {
		client.close();
		console.error('Error in FTP upload:');
		console.error(err);
		callback(false, err);
	});
}
