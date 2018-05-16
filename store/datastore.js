// Datastore connection and Dataset definition
const gcloud = require('google-cloud');

const config = require('../config');
const logger = require('../logger');
const Util = require('../util');
var merge = require('util-merge');

const namespace = config.ds_namespace;
const dataset = gcloud.datastore({
	projectId: config.ds_projectId,
	keyFilename: config.ds_keyFilename
});


function Key(kind, id) {
	const path = [kind];

	if(id && !isNaN(Number(id))) {
		path.push(Number(id));
	} else if(id) {
		path.push(id);
	}

	return dataset.key({
		namespace: namespace,
		path: path
	});

}

/**
 *	 
 */
function get(kind, id, cb) {
	if(!cb && typeof(id) === 'function') {
		cb = id;
		cb(null);
		return false;
	} else if(!cb && !id && !kind) {
		return false;
	}

	const key = Key(kind, id);
	dataset.get(key, function(err, entity) {
		if(err) {
			logger.error('There have been an error retieving the '+ kind +' from Datastore');
			logger.error(err, true);
			cb(null);
			return false;
		}

		if(typeof(entity) === 'undefined' && typeof(cb) === 'function') {
			cb(null);
		} else if(typeof(cb) === 'function') {
			cb(entity);
		}
	});
}

/**
 *	 
 */
function upsert(kind, data, id, cb) {
	if(!cb && typeof(id) === 'function') {
		cb = id;
		id = null;
	} else if(!id) {
		id = null;
	}

	if(!data || !kind) {
		logger.warn('Tryed to upsert in datastore with undefined kind or data. Nothing done');
		if(typeof(cb) === 'function') {
			cb(false);
		}
		return false;
	}

	const key = Key(kind, id);

	// CHECH IF IS UPSERT. IF SO, GET THE ENTITY AND MERGE CHANGES.
	if(id) {
		get(kind, id, function(storedData) {
			
			if(!storedData) {
				storedData = {};
			}

			// const merged = Util.merge(storedData, data);
			const merged = merge(storedData, data);

			save(key, merged, cb);
		});
	} else {
		save(key, data, cb);
	}
}

/**
 *	 [internal]
 */
function save(key, data, cb) {
	dataset.save({
        key: key,
        data: data
    },
		function(err) {
			if(err) {
        logger.error('There have been an error upserting the '+ key.path[0] +' '+ key.path[1] +' to datastore');
        logger.error(err, true);
        if(cb && typeof cb === 'function') {
        	cb(false, null);
        }
        return false;
			}

			if(cb && typeof(cb) === 'function') {
				cb(true, key.path[1]);
			}
	});
}

/**
 *	 
 */
function remove(kind, id, cb) {
	if(!cb && typeof(id) === 'function') {
		cb = id;
		id = null;
	} else if(!cb || !id) {
		return false;
	}

	const key = Key(kind, id);

	dataset.delete(key, function(err) {
		if(err) {
			logger.error('There have been an error removing the '+ kind +' to datastore');
			logger.error(err, true);
			if(cb && typeof(cb) === 'function') {
				cb(false);
			}
		}
		if(cb && typeof(cb) === 'function') {
			cb(true);
        }
	});

}

/**
 *	 
 */
function query(kind, options, cb) {

	if(!kind) {
		cb(false);
		return false;
	}

	const filters = options.filters || null;
	const groupBy = options.groupBy || null;
	const limit = options.limit || null;
	const offset = options.offset || null;
	const orderBy = options.orderBy || null;

	var query = dataset.createQuery(namespace, kind);

	if(filters) {
		for(let filter in filters) {
			query = query.filter(filters[filter].field, filters[filter].operator, filters[filter].value);
		}
	}

	if(groupBy && Array.isArray(groupBy) && groupBy.length > 0) {
		query = query.groupBy(groupBy);
	}

	if(limit && limit > -1) {
		query = query.limit(limit);
	}

	if(offset && offset > -1) {
		query = query.offset(offset);
	}

	if(orderBy) {
		let order = orderBy;
		let desc = false;
		if(order.indexOf('-') === 0) {
			order = order.replace('-', '');
			desc = true;
		}

		query = query.order(order, {
		  descending: desc
		});
	}

	query.run(function(err, entities, info) {
		// We shall do this with this info, to enable cursors...
		logger.log(info);
		cb(entities.map(fromDatastore));
	});

}

/** fromDatastore
 *	Translates from Datastore's entity format to
 *	the format expected by the application.
 *
 *	Datastore format:
 *	{
 *		key: [kind, id],
 *		data: {
 *			property: value
 *		}
 *	}
 *
 *	Application format:
 *	{
 *		_id: id,
 *		property: value
 *	}
 */
function fromDatastore (obj) {
  obj._id = obj[gcloud.datastore.KEY].id;
  return obj;
}


module.exports = {
	_ns: namespace,
	_dataset: dataset,
	_key: Key,
	// ToDo: Manage indexes!!
	index: function () { return true; },
	get: get,
	query: query,
	add: upsert,
	update: upsert,
	upsert: upsert,
	remove: remove
};
