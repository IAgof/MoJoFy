/*
TO DO:
 - Add Group By to search model
*/
console.warn('[store/elasticsearch.js] Elasticsearch Query groupBy not implemented.');

const elasticsearch = require('elasticsearch');
const config = require('../config');
const logger = require('../logger');

const INDEX = config.elastic_index;
const login = config.elastic_user ? ( config.elastic_pass ? config.elastic_user + ':' + config.elastic_pass + '@' : config.elastic_user + '@' ) : '';

// connect elasticsearch
var client = new elasticsearch.Client({
	host: 'http://' + login + config.elastic_host + ':' + config.elastic_port,
	log: config.elastic_log,
	// log: 'error',
	maxRetries: 7,
	maxSockets: 50,
	keepAlive: true
});

client.indices.exists({ index: config.elastic_index }).then(function (exists) {
	if (!exists) {
		console.log("Creating index %s", config.elastic_index);
		return client.indices.create({ index: config.elastic_index })
	}
}).catch(logger.error);

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
	
	if (typeof data._id !== 'undefined') {
		delete data._id;
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
 * @param {elasticRemoveCallback} cb Callback on remove (or error)
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
			cb(false);
			return false;
		}

		logger.log('Removed achievement in Elastic');
		cb(true);
	});
}

/**
 * Callback for elastic search function.
 * 
 * @callback elasticSearchCallback
 * @param {array} results List of entities matching query
 */
/**
 * Search data in elasticseatch by query
 *
 * @param {string} type	Document type (sql "table")
 * @param {object} options	Query options
 * @param {elasticSearchCallback} cb Callback on query results (or error)
 */
function search(type, options, cb) {
	return query(type, 'search', options, function (response) {
		// Parse possible errors
		if(response === null || typeof(response.hits) == 'undefined') {
			cb([]);
			return false;
		}

		var searchArray = [];

		for(var i = 0; i < response.hits.hits.length; i++) {
			response.hits.hits[i]._source._id = response.hits.hits[i]._id;
			searchArray.push(response.hits.hits[i]._source);
		}

		if(cb && typeof cb) {
			cb(searchArray);
		}
	});
}

/**
 * Callback for elastic count function.
 * 
 * @callback elasticCountCallback
 * @param {array} results List of entities matching query
 */
/**
 * Count data in elasticseatch by query
 *
 * @param {string} type	Document type (sql "table")
 * @param {object} options	Query options
 * @param {elasticCountCallback} cb Callback with count (or error)
 */
function count(type, options, cb) {
	return query(type, 'count', options, function (response) {
		const result = response.count || null
		cb(result);
	});
}

// 
/**
 * Callback for elastic search function.
 * 
 * @callback elasticQueryCallback
 * @param {array} results List of entities matching query
 */
/**
 * [internal] Query data to elasticseatch
 *
 * @param {string} type	Document type (sql "table")
 * @param {string} operation	Type of operation to perform (count, search...) 
 * @param {object} options	Query options
 * @param {elasticQueryCallback} cb Callback on query results (or error)
 */


// query(type, 'search', options, function (response) {
function query(type, operation, options, cb) {
	if(!type || !options) {
		if(cb && typeof cb) {
			cb();
		}
		return false;
	}

	const body = {};

	if(typeof options === 'function' && !cb) {
		// !options. Match all.
		body.query = {"match_all": {}}
		cb = options;
	} else {
		filters(body, options);
		queryFilters(body, options);
		limits(body, options);
		order(body, options);
		// TODO:
		// groupBy(body, options);
	}

	client[operation]({
		index: INDEX,
		type: type,
		body: body
	}, function(error, response) {
		
		// Log errors
		if(error) {
			logger.error("Error querying elasticsearch: ", error);
			cb(null);
			return false;
		}

		cb(response);
	});
}

/**
 * [internal] Parse filters to elasticsearch query syntax 
 *
 * @param {object} body ElasticSearch search request body *WILL BE MODIFIED*
 * @param {object} options Filters to add
 * @return {object} body ElasticSearch constructed search request body
 */
function filters(body, options) {
	if (options.filters) {
		if( !body.query) {
			body.query = { bool: {} };
		}

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

	return body;
}

/**
 * [internal] Parse limits (from, offset) to elasticsearch query syntax 
 *
 * @param {object} body ElasticSearch search request body *WILL BE MODIFIED*
 * @param {object} options Limits to add
 * @return {object} body ElasticSearch constructed search request body
 */
function limits(body, options) {
	if (!body) { 
		body = {};
	}

	if (options.limit && typeof !isNaN(Number(options.limit))) {
		body.size = Number(options.limit);
	}

	if (options.offset && typeof !isNaN(Number(options.offset))) {
		body.from = Number(options.offset);
	}

	return body;
}

/**
 * [internal] Parse order to elasticsearch query syntax 
 *
 * @param {object} body ElasticSearch search request body *WILL BE MODIFIED*
 * @param {object} options Order to add
 * @return {object} body ElasticSearch constructed search request body
 */
function order(body, options) {
	if (!body) { 
		body = {};
	}

	if (options.orderBy) {
		const sort = {}
		let field = options.orderBy;
		let order = 'asc';

		if(field.indexOf('-') === 0) {
			field = field.replace('-', '');
			order = 'desc';
		}

		sort[field] = order;
		body.sort = [sort];
	}

	return body;
}

/**
 * [internal] Parse query to elasticsearch query syntax 
 *
 * @param {object} body ElasticSearch search request body *WILL BE MODIFIED*
 * @param {object} options Query to add
 * @return {object} body ElasticSearch constructed search request body
 */
function queryFilters(body, options) {
	if (!body) { 
		body = {};
	}

	if (options.query && Array.isArray(options.query)) {
		if (!body.query || !body.query.bool) {
			body.query = { bool: {} };
		}

		if (!body.query.bool.should) {
			body.query.bool.should = [];
		}

		for (var i = 0; i < options.query.length; i++) {
			const match = { match: {} };
			match.match[options.query[i].field] = options.query[i].value;

			const prefix = { prefix: {} };
			prefix.prefix[options.query[i].field] = options.query[i].value;

			const wildcard = { wildcard: {} };
			wildcard.wildcard[options.query[i].field] = '*' + options.query[i].value + '*';

			body.query.bool.should.push(match);
			body.query.bool.should.push(prefix);
			body.query.bool.should.push(wildcard);
		}
	}

	return body;
}

module.exports = {
	// ToDo: Manage indexes!!
	index: function () { return true; },
	get: get,
	query: search,
	count: count,
	add: upsert,
	update: upsert,
	upsert: upsert,
	remove: remove
};