const Bluebird = require('bluebird');
const PromisifierUtils = require('../util/promisifier-utils');

const ds = require('../store/datastore');
const datastore = Bluebird.promisifyAll(ds, { promisifier: PromisifierUtils.noErrPromisifier });


function removeAllEntities(type) {
	return datastore.queryAsync(type, {}) // TODO(jliarte): 13/07/18 insert { limit: } ?
		.then((tracks) => {
			if (tracks && tracks.length > 0) {
				console.log("retrieved tracks  ", tracks);
				const ids = tracks.map( project => project._id );
				return datastore._removeMulti(type, ids).then(res => console.log("res deleting tracks ", res));
			}
			return Promise.resolve();
		});
}

module.exports = {
	removeAllEntities
};