const AWS = require('aws-sdk');
const Nanoid = require('nanoid');
const config = require('../config');
const logger = require('../logger')(module);
const merge = require('util-merge');

/** Converter:
 *	Searching through the AWS JS library, there is a file called converter.js 
 *	that has the methods that can remove the DynamoDB Attribute values. These 
 *	methods are not in the documentation but it parse outputs.
 *
 *	Full thread: https://forums.aws.amazon.com/thread.jspa?threadID=242408
 */
const converter = require('aws-sdk/lib/dynamodb/converter.js');

const DEFAULT_READ_CAPACITY_UNITS = 2;
const DEFAULT_WRITE_CAPACITY_UNITS = 2;

AWS.config = new AWS.Config({
	accessKeyId: config.aws_accessKey,
	secretAccessKey: config.aws_secretKey,
	region: config.aws_region
});

AWS.config.apiVersions = {
	dynamodb: '2012-08-10'
};


const dynamodb = new AWS.DynamoDB();

const tables = [];

// On Start...
dynamodb.listTables(function (err, data) {
	for (let i = 0; i < data.TableNames.length; i++) {
		tables.push(data.TableNames[i]);
	}
});

/** [internal] prepareSecondaryIndexes
 *	
 *	@param {object} table A DynamoDB table structure to update with indexes
 *	@param {array} indexes A [String] Array with field to index names 
 */
function prepareSecondaryIndexes(table, indexes) {
	if (!table) {
		return logger.error('No table selected!!');
	}

	if (!table.GlobalSecondaryIndexes) {
		table.GlobalSecondaryIndexes = [];
	}

	for (let i = 0; i < indexes.length; i++) {
		table.GlobalSecondaryIndexes.push({
			IndexName: table.TableName +'_'+ indexes[i],
			KeySchema: [{
				AttributeName: indexes[i],
				KeyType: "HASH"
			}],
			Projection: {
				ProjectionType: 'ALL'
			},
			ProvisionedThroughput: {       
				ReadCapacityUnits: DEFAULT_READ_CAPACITY_UNITS, 
				WriteCapacityUnits: DEFAULT_WRITE_CAPACITY_UNITS
			}
		});

		table.AttributeDefinitions.push({ 
			AttributeName: indexes[i], 
			AttributeType: 'S'
		});
	}
}

/**
 * Callback for DynamoDB createTable function.
 * 
 * @callback dynamoCreateTableCallback
 * @param {boolean} error Error message or null if success
 * @param {string} name Table name, or null on error
 */
/**	createTable
 *	Create a new dynamodb table, including secondary indexes
 *
 *	@param {string} table 	Table name
 *	@param {array}	indexes	Array of strings with fields to index names
 *	@param {dynamoCreateTableCallback}	cb	Callback to execute on operation complete.
 */
function createTable(table, indexes, cb) {
	if (typeof indexes === 'function') {
		cb = indexes;
		indexes = [];
	}

	if (tables.indexOf(config.db_table_prefix + table) > -1 || tables.indexOf(config.table) > -1) {
		if (cb) {
			cb(null, table);
		}
		return false;
	}

	// ToDo: Check if we can get more complex structures based on future querys
	const tableSchema = {
		TableName: config.db_table_prefix + table,
		KeySchema: [
			{ AttributeName: "_id", KeyType: "HASH"},  // Partition key
		],
		AttributeDefinitions: [       
			{ AttributeName: "_id", AttributeType: "S" }
		],
		ProvisionedThroughput: {       
			ReadCapacityUnits: DEFAULT_READ_CAPACITY_UNITS, 
			WriteCapacityUnits: DEFAULT_WRITE_CAPACITY_UNITS
		}
	};

	// SET INDEXES!!
	if (indexes && indexes.length > 0) {
		prepareSecondaryIndexes(tableSchema, indexes);
	}

	dynamodb.createTable(tableSchema, function(err, data) {
		if (err) {
			logger.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
			typeof cb === 'function' && cb(err, null);
		} else {
			// logger.debug("Created table. Table description JSON:", JSON.stringify(data, null, 2));
			tables.push(table);
			typeof cb === 'function' && cb(null, table);
		}
	});
}

/**
 * Callback for DynamoDB upsert function.
 * 
 * @callback dynamoUpsertCallback
 * @param {boolean} success True if upserted, false on error
 * @param {string} id Id of the upserted element
 */
/**
 * Insert or update data in DynamoDB
 *
 * @param {string} table Table name (sql "table")
 * @param {object} rawData Data to write
 * @param {string} key	Table Hash Key (sql "primary key")
 * @param {dynamoUpsertCallback} cb Callback on upsert (or error)
 */
function upsert(table, rawData, key, cb) {
	if (!table || !rawData) {
		if (cb && typeof cb === 'function') {
			cb(false, null);
		}
		return false;
	}
	if (typeof key === 'function') {
		cb = key;
		key = null;
	}

	const data = cleanUnsafeData(rawData);

	if (typeof data._id !== 'undefined' || key !== null) {
		data._id = key || data._id;
		// Probably there was something. To do a good upsert, we shall get the 
		// row, and merge it with given data (to patch instead of put).
		get(table, data._id, function (err, gottenData) {
			let mergedData = data;
			if (typeof gottenData !== 'undefined' && gottenData !== null) {
				mergedData = merge(gottenData, data);
			}
			save(table, mergedData, cb);
		});
	} else if (typeof data._id === 'undefined' && key === null) {
		// generate a new id, and set it to _id
		data._id = Nanoid();
		save(table, data, cb);
	}
}

/** [internal] cleanUnsafeData
 *	Detect and act on data that might cause an error in DynamoDB
 */
function cleanUnsafeData(rawData) {
	const data = {};
	for (let param in rawData) {
		if (rawData[param] instanceof Date) {
			data[param] = rawData[param].toString();
		} else if (rawData[param] !== '') {
			data[param] = rawData[param];
		}
	}

	return data;
}

/** [internal] save
 *	Save, no question asking, a row in dynamo.
 */
function save(table, data, cb) {
	if (tables.indexOf(config.db_table_prefix + table) === -1) {
		// Table does not exist. Create it. 
		createTable(table, function(err, res) {
			upsert(table, data, cb);
		});

		return false;
	}

	// Prepare insert
	const params = {
		TableName: config.db_table_prefix + table,
		Item: data
	};

	// Prepare AWS document client
	const docClient = new AWS.DynamoDB.DocumentClient();

	// logger.debug("Adding a new item to DynamoDB...");
	docClient.put(params, function(err, putData) {
		if (err) {
			logger.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
			typeof cb === 'function' && cb(false, null);
		} else {
			typeof cb === 'function' && cb(true, data._id);
		}
	});
}

/**
 * Callback for DynamoDB get function.
 * 
 * @callback dyanmoGetCallback
 * @param {object} data Data gotten or null
 */
/**
 * Get a document by type and ID
 *
 * @param {string} table	Table name (sql "table")
 * @param {string} key	Table Hash Key (sql "primary key")
 * @param {dyanmoGetCallback} cb 	Callback on get (or error)
 */
function get(table, key, cb) {
	let docClient = new AWS.DynamoDB.DocumentClient();

	let params = {
		TableName: config.db_table_prefix + table,
		KeyConditionExpression: "#id = :key",
		ExpressionAttributeNames: {
			"#id": "_id"
		},
		ExpressionAttributeValues: {
			":key": key
		}
	};

	docClient.query(params, function(err, data) {
		if (err) {
			logger.error("Unable to query. Error:", JSON.stringify(err, null, 2));
			typeof cb === 'function' && cb(null);
		} else {
			typeof cb === 'function' && cb(data.Items[0] || null);
		}
	});
}

/**
 * Callback for DynamoDB query function.
 * 
 * @callback dynamoSearchCallback
 * @param {array} results List of entities matching query or null if error
 */
/**
 * Search data in elasticseatch by query
 *
 * @param {string} table	Table name (sql "table")
 * @param {object} params	Query options
 * @param {dynamoSearchCallback} cb Callback on query results (or error)
 */
function query(table, params, cb) {
	logger.debug('[dynamo] querying ', table, " with params ", params);
	if (typeof params === 'function') {
		cb = params;
		params = undefined;
	}

	if (!table) {
		typeof cb === 'function' && cb(null);
		return false;
	}

	if (!params || Object.keys(params).length === 0) {
		return list(table, cb);
	} else {
		return search(table, params, cb);
	}
}

/**
 * Callback for DynamoDB remove function.
 * 
 * @callback dynamoRemoveCallback
 * @param {boolean} error Error message or null if success
 * @param {object} data Dynamo removed info, or null on error
 */
/**	remove
 *	Remove a dynamo row
 *
 *	@param {string} table 	Table name
 *	@param {string}	key	Id of the object
 *	@param {dynamoRemoveCallback}	cb	Callback to execute on operation complete.
 */
function remove(table, key, cb) {
	let docClient = new AWS.DynamoDB.DocumentClient();

	let params = {
		TableName: config.db_table_prefix + table,
		Key: {
			"_id": key
		}
		// KeyConditionExpression: "#id = :key",
		// ExpressionAttributeNames:{
		// 	"#id": "_id"
		// },
		// ExpressionAttributeValues: {
		// 	":key": key
		// }
	};

	docClient.delete(params, function(err, data) {
		if (err) {
			logger.error("Unable to query. Error:", JSON.stringify(err, null, 2));
			typeof cb === 'function' && cb(false, 'Error!'); // TODO(jliarte): 17/07/18 at least match callback api among different store imlpementations!!! ¬¬
		} else {
			typeof cb === 'function' && cb(data, null);
		}
	});
}

function removeMulti(table, keys) {
	return new Promise((resolve, reject) => {
		let deleteRequestItems = [];
		if (keys && keys.length > 0) {
			deleteRequestItems = keys.map(id => { return {
				DeleteRequest: {
					Key: {
						"_id": id
					}
				}
			}});

			const tableName = config.db_table_prefix + table;
			const params = {
				RequestItems: {
					tableName: deleteRequestItems,
				},
				// ReturnConsumedCapacity: INDEXES | TOTAL | NONE,
				// ReturnItemCollectionMetrics: SIZE | NONE
			};
			dynamodb.batchWriteItem(params, function(err, data) {
				if (err) {
					console.log(err, err.stack);
					reject(err);
				} else {
					console.log(data);
					resolve(data);
				}
			});
		} else resolve([]); // (jliarte): 16/10/18 no items to delete!
	});
}


/* --- Internal functions -- */

function list(table, cb) {
	logger.debug('[dynamo] performing scan');
	dynamodb.scan({TableName: config.db_table_prefix + table}, function(err, data) {
		if (err) {
			logger.error('Error scanning dynamodb:', err);
			typeof cb === 'function' && cb(err, null);
			return false;
		}

		const response = data.Items.map(function(item) {
			Object.keys(item).map(function(key, index) {
			   item[key] = converter.output(item[key]);
			});
			return item;
		});

		typeof cb === 'function' && cb(response);
	});
}

function search(table, params, cb) {
	let conditionExpression = '';
	const expressionNames = {};
	const expressionValues = {};

	for (let i = 0; i < params.filters.length; i++) {
		const filter = params.filters[i];
		if (i > 0) {
			conditionExpression += ' and ';
		}
		conditionExpression += '#field'+ i +' '+ filter.operator +' :field'+ i;
		expressionNames['#field'+i] = filter.field;
		expressionValues[':field'+i] = filter.value;
	}

	// ToDo: Limit
	// ToDo: Offset
	// ToDo: OrderBy
	// ToDo: GroupBy

	let queryParams = {
		TableName: config.db_table_prefix + table,
		KeyConditionExpression: conditionExpression,
		ExpressionAttributeNames: expressionNames,
		ExpressionAttributeValues: expressionValues,
	};

	if (params && params.filters && params.filters.length > 0) {
		const indexName = table +'_'+ params.filters[0].field;
		queryParams.IndexName = config.db_table_prefix + indexName;
	}
	logger.debug('[dynamo] query params are', queryParams);

	let docClient = new AWS.DynamoDB.DocumentClient();
	docClient.query(queryParams, function(err, data) {
		if (err) {
			logger.debug("Unable to query. Error:", JSON.stringify(err, null, 2));
			typeof cb === 'function' && cb(null);
		} else {
			// logger.debug("Query succeeded.");
			typeof cb === 'function' && cb(data.Items || []);
		}
	});

}


const exposed = {
	_createTable: createTable,
	index: createTable,
	get: get,
	query: query,
	// count: count,
	add: upsert,
	update: upsert,
	upsert: upsert,
	remove: remove,
	_removeMulti: removeMulti,
};

module.exports = exposed;