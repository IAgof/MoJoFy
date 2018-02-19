
/*

BE CAREFUL! Work in progress! This still unstable and unfinished!

TO DO:

 - Add get function
 - Document all the functions (jsdocs)
 - Study insert vs update use case
 - Create the search model converter
 - Standarize callbacks (see datastore.js)

*/

console.warn('[store/elasticsearch.js] BE CAREFUL! Work in progress! This still unstable and unfinished!');

const elasticsearch = require('elasticsearch');
const config = require('../config');
const logger = require('../logger');

const INDEX = config.elastic_index;
var login = config.elastic_user ? (config.elastic_pass ?  config.elastic_user + ':' +  config.elastic_pass + '@') : config.elastic_user + '@' : '';

// connect elasticsearch
var client = new elasticsearch.Client({
	host: 'http://' + login + config.elastic_host + ':' + elastic_port,
	// log: config.elastic_log,
	// log: 'error',
	log: ['error', 'debug', 'info'],
	maxRetries: 7,
	maxSockets: 50,
	keepAlive: true
});

/**
 *	 
 */
function get(type, id, cb) {

	// Look for an example of this query

	cb();
}

/**
 *	 
 */
function upsert(type, data, id, cb) {

	// TODO:
	// Check if index exists or not
	
	// Add an index
	client.index({
		index: INDEX,
		type: type,
		id: id,
		body: data
	}, function (error, response) {
		if(error) {
			logger.error('Have been an error writting in ElasticSearch!!');
			logger.error(error);
			cb(error);
		} else {
			logger.log('Successfully added ' + type + ' to ElasticSearch');
		}

		// logger.log(response);
		cb(response);
	});
}

/**
 *	 
 */
function remove(type, id, cb) {
	client.delete({
		index: INDEX,
		type: type,
		id: id
	}, function (error, response) {
		if(error) {
			logger.error('Have been an error removing from ElasticSearch!!');
			logger.error(error);
			cb(error);
		} else {
			logger.log('Removed achievement in Elastic');
		}

		cb(response);
	});
}

/**
 *	 
 */
function query(type, options, cb) {

	// TODO:
	// Convert our query model to elastic model

	client.search({
		index: INDEX,
		type: type,
		body: {
			query: {
				match: { type: 'create' } 
			},
			sort: {
				added: { order: "desc" }
			},
			size: 3
		}
	}, function(error, response) {
		
		// Log errors
		if(error) {
			console.log(error);
			cb(null);
		}

		// Parse possible errors
		if(typeof(response.hits) == 'undefined') {
			response.hits = [];
		}

		var searchArray = [];

		for(var i = 0; i < response.hits.hits.length; i++) {
			response.hits.hits[i]._source.pid = response.hits.hits[i]._id;
			searchArray.push(response.hits.hits[i]._source);
		}

		cb(searchArray);

	});

	// cb();
}


module.exports = {
	get: get,
	query: query,
	add: upsert,
	update: upsert,
	upsert: upsert,
	remove: remove
};