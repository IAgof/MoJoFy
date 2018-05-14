const AWS = require('aws-sdk');
const Promise = require('bluebird');
const config = require('../../config');
const logger = require('../../logger');

AWS.config = new AWS.Config({
	accessKeyId: config.aws_accessKey,
	secretAccessKey: config.aws_secretKey,
	region: config.aws_region
});

AWS.config.setPromisesDependency(Promise);

AWS.config.apiVersions = {
	s3: '2006-03-01'
};

exports.upload = upload;
exports.remove = remove;

function upload(remotePath, buffer) {
	let s3 = new AWS.S3();
	
	let params = {
		Bucket: config.aws_s3Bucket,
		Key: config.storage_bucket + remotePath,
		Body: buffer,
		ACL: 'public-read',
		ContentEncoding: 'base64'
	};
	
	return s3.upload(params).promise();
}

function remove(remotePath) {
	let s3 = new AWS.S3();
	
	let params = {
		Bucket: config.aws_s3Bucket,
		Key: remotePath
	};
	
	return s3.deleteObject(params).promise();
}
