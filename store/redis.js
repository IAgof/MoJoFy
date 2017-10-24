// Datastore connection and Dataset definition
// Redis connection

const redis = require('redis');

const Redis = redis.createClient('6379', 'YOUR_REDIS_SERVER_IP');

Redis.auth('YOUR_REDIS_PASSWORD');
Redis.on('connect', function() {
	console.log('Redis connected');
});

//

function addList(type, id, from, cb) {
	

	Redis.multi()
        .sadd(type, id)
        .sadd(type +'_'+ id, from)
        .exec(function(err, replies) {
        	if(err) {
        		console.log('redis error');
        		console.log(err);
        	}
            console.log('Added new like to publication ' + id + '. Now, it have ' + replies[0] + ' likes (in Redis).');
            cb();
        });
}

module.exports = {
	// get: get,
	// query: query,
	// add: upsert,
	addList: addList
	// update: upsert,
	// upsert: upsert,
	// remove: remove
};
