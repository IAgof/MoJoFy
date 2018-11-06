const Bluebird = require('bluebird');
const PromisifierUtils = require('../util/promisifier-utils');

const ds = require('../store/datastore');
const datastore = Bluebird.promisifyAll(ds, { promisifier: PromisifierUtils.noErrPromisifier });


function removeAllEntities(type) {
	return datastore.queryAsync(type, {}) // TODO(jliarte): 13/07/18 insert { limit: } ?
		.then((entities) => {
			if (entities && entities.length > 0) {
				const ids = entities.map( project => project._id );
				return datastore._removeMulti(type, ids).then(res => console.log("res deleting entities ", res));
			}
			return Promise.resolve();
		});
}

function prepareRetrievedEntityToCompare(entity) {
	entity.id = entity._id;
	delete entity._id;
	delete entity.creation_date;
	delete entity.modification_date;
}

module.exports = {
	removeAllEntities,
	prepareRetrievedEntityToCompare
};