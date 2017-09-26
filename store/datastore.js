// Datastore connection and Dataset definition

const gcloud = require('google-cloud');

const config = require('../config');
const logger = require('../logs/logger');
const Util = require('../util');

const namespace = config.namespace;
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

function get(kind, id, cb) {

	if(!cb && typeof(id) === 'function') {
		cb = id;
		cb(null);
		return false;
	} else if(!cb || !id || !kind) {
		return false;
	}

	const key = Key(kind, id);

	dataset.get(key, function(err, entity) {

		if(err) {
			logger.err('There have been an error retieving the '+ kind +' from Datastore');
			logger.err(err, true);
			cb(null);
			return false;
		}

		if(typeof(entity) === 'undefined' && typeof(cb) === 'function') {
			cb(null);
		} else if(typeof(cb) === 'function') {
			cb(entity.data);
		}
	});
}

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

			const merged = Util.merge(storedData, data);
			save(key, merged, cb);
		});
	} else {
		save(key, data, cb);
	}
}

function save(key, data, cb) {

	dataset.save({
        key: key,
        data: data
    },
    function(err) {
        if(err) {
        	logger.err('There have been an error upserting the '+ key.path[0] +' '+ key.path[1] +' to datastore');
			logger.err(err, true);
			cb(false, null);
			return false;
        }

        if(typeof(cb) === 'function') {
			cb(true, key.path[1]);
        }
    });

}

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
			logger.err('There have been an error removing the '+ kind +' to datastore');
			logger.err(err, true);
			cb(false);
		}
		if(typeof(cb) === 'function') {
			cb(true);
        }
	});

}


module.exports = {
	_ns: namespace,
	_dataset: dataset,
	_key: Key,
	get: get,
	add: upsert,
	update: upsert,
	upsert: upsert,
	remove: remove
};
