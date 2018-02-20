
/*

BE CAREFUL! Work in progress! This still unstable and unfinished!

TO DO:

 - Document all the functions (jsdocs)
 - Create the search model converter
 - Standarize callbacks (see datastore.js)

*/

console.warn('[store/elasticsearch.js] BE CAREFUL! Work in progress! This still unstable and unfinished!');

const elasticsearch = require('elasticsearch');
const config = require('../config');
const logger = require('../logger');

const INDEX = config.elastic_index;
var login = config.elastic_user ? ( config.elastic_pass ? config.elastic_user + ':' + config.elastic_pass + '@' : config.elastic_user + '@' ) : '';

// connect elasticsearch
var client = new elasticsearch.Client({
	host: 'http://' + login + config.elastic_host + ':' + config.elastic_port,
	log: config.elastic_log,
	// log: 'error',
	maxRetries: 7,
	maxSockets: 50,
	keepAlive: true
});

/**
 * Callback for elastic get function.
 * 
 * @callback elasticGetCallback
 * @param {object} data Data gotten or null
 */
/**
 * Get a document by type and ID
 *
 * @param {string} type	Document type (sql "table")
 * @param {string} id	Document ID (sql "primary key")
 * @param {elasticGetCallback} cb 	Callback on get (or error)
 */
function get(type, id, cb) {
	if(!type || !id) {
		if(cb && typeof cb) {
			cb();
		}
		return false;
	}

	client.get({
		index: INDEX,
		type: type,
		id: id
	}, function (error, response) {
		if(error) {
			logger.error(error);
		}

		if(response && response.found && response._source){
			cb(response._source);
		} else {
			cb(null);
		}
	});
}

/**
 * Callback for elastic upsert function.
 * 
 * @callback elasticUpsertCallback
 * @param {boolean} success True if upserted, false on error
 * @param {string} id Id of the upserted element
 */
/**
 * Insert or update data in elasticseatch
 *
 * @param {string} type	Document type (sql "table")
 * @param {object} data Data to write
 * @param {string} id	Document ID (sql "primary key")
 * @param {elasticUpsertCallback} cb Callback on upsert (or error)
 */
function upsert(type, data, id, cb) {
	if(!type || !data) {
		if(cb && typeof cb) {
			cb();
		}
		return false;
	}

	const options = {
		index: INDEX,
		type: type,
		body: data
	};

	if(id && typeof id !== 'function') {
		options.id = id;
	} else if(typeof id === 'function') {
		cb = id;
	}

	// Add an index
	client.index(options, function (error, response) {
		if(error) {
			logger.error('Have been an error writting in ElasticSearch!!');
			logger.error(error);
			cb(error);
		} else {
			logger.log('Successfully added ' + type + ' to ElasticSearch');
		}

		// logger.log(response);
		if(cb && typeof cb) {
			cb(response);
		}
	});
}

/**
 * Callback for elastic remove function.
 * 
 * @callback elasticRemoveCallback
 * @param {boolean} success True if removed, false on error
 */
/**
 * Remove data in elasticseatch by ID
 *
 * @param {string} type	Document type (sql "table")
 * @param {string} id	Document ID (sql "primary key")
 * @param {elasticUpsertCallback} cb Callback on remove (or error)
 */
function remove(type, id, cb) {
	if(!type || !id) {
		if(cb && typeof cb) {
			cb();
		}
		return false;
	}

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
 * Callback for elastic query function.
 * 
 * @callback elasticRemoveCallback
 * @param {array} results List of entities matching query
 */
/**
 * Query data in elasticseatch by ID
 *
 * @param {string} type	Document type (sql "table")
 * @param {object} options	Query options
 * @param {elasticUpsertCallback} cb Callback on remove (or error)
 */
function query(type, options, cb) {
	if(!type || !options) {
		if(cb && typeof cb) {
			cb();
		}
		return false;
	}

	var body = options;

	if(typeof options === 'function' && !cb) {
		cb = options;
		body = {}
	} 
	

	// TODO:
	// Convert our query model to elastic model
	if (options.filters) {
		body.query = {bool: { must: [] }}; 

		for(let filter in option filters) {
			console.log(filters[filter]);
		}
	}

	body = {
		query: {
			bool: {
				must: [
					{ match: { type: 'create' } }
				]
			}
		},
		sort: {
			added: { order: "desc" }
		},
		size: 3
	}

	const filters = options.filters || null;
	const groupBy = options.groupBy || null;
	const limit = options.limit || null;
	const offset = options.offset || null;
	const orderBy = options.orderBy || null;

	// --------------- 


	client.search({
		index: INDEX,
		type: type,
		body: body
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

		if(cb && typeof cb) {
			cb(searchArray);
		}

	});
}

/* [internal] parse filters to elasticsearch query syntax */
function filters(body, options) {
	if (options.filters) {
		body.query = { bool: {} };
		for(var filter in options.filters) {
			var f = options.filters[filter];
			var e = {};

			switch (f.operator) {
				case '=':
				case '!=':
					e.match = {};
					e.match[f.field] = f.value
					break;

				case '>':
				case '>=':
				case '<=':
				case '<':
					var op = '';
					if (f.operator === '>') {
							op = 'gt';
					} else if (f.operator === '>=') {
							op = 'gte';
					} else if (f.operator === '<') {
							op = 'lt';
					} else if (f.operator === '<=') {
							op = 'lte';
					}

					e.range = {};
					e.range[f.field] = {}
					e.range[f.field][op] = f.value;
					break;

				default:
					continue;

			}

			if(f.operator === '!=') {
				if (typeof body.query.bool.must_not === 'undefined') {
					body.query.bool.must_not = [];
				}
				body.query.bool.must_not.push(e);
			} else {
				if (typeof body.query.bool.must === 'undefined') {
					body.query.bool.must = [];
				}
				body.query.bool.must.push(e);
			}

		}
	}
}

module.exports = {
	get: get,
	query: query,
	add: upsert,
	update: upsert,
	upsert: upsert,
	remove: remove
};