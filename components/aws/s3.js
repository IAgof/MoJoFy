const AWS = require('aws-sdk');
const Promise = require('bluebird');
const config = require('../../config');
const logger = require('../../logger')(module);

AWS.config.setPromisesDependency(Promise);

AWS.config = new AWS.Config({
	accessKeyId: config.aws_accessKey,
	secretAccessKey: config.aws_secretKey,
	region: config.aws_region
});

AWS.config.apiVersions = {
	s3: '2006-03-01'
};

exports.upload = upload;
exports.remove = remove;

function upload(remotePath, buffer) {
	let s3 = new AWS.S3();
	
	let params = {
		Bucket: config.storage_bucket,
		Key: remotePath,
		Body: buffer,
		ACL: 'public-read',
		ContentEncoding: 'base64'
	};

	logger.debug("[S3 driver] launching s3.upload");
	return s3.upload(params).promise();
}

function remove(remotePath) {
	let s3 = new AWS.S3();
	
	let params = {
		Bucket: config.storage_bucket,
		Key: remotePath
	};
	
	return s3.deleteObject(params).promise();
}
