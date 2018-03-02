const videoStore = require('./store.js');
const elastic = require('../../store/elasticsearch');
const config = require('../../config')

const type = 'video';

function createIndex() {
	function extracted(exists) {
		if (exists) {
			console.log("Index %s already exists!", config.elastic_index);
			return Promise.resolve();
		} else {
			console.log("Creating index %s", config.elastic_index);
			return elastic.__client__.indices.create({ index: config.elastic_index })
		}
	}

	return elastic.__client__.indices.exists({ index: config.elastic_index })
		.then(extracted);
}

function feedVideo(video) {
	const id = video.id || video._id || null;
	delete video.id;
	delete video._id;

	elastic.add(type, video, id, function(resultSearch, idSearch) {
		console.log(resultSearch);
	});
}

function populateElasticWithVideos() {
	return new Promise(resolve => {
		videoStore.listPersistence({}, (videos => {
			console.log("populating elasitc with %d videos", videos.length);
			videos.forEach(feedVideo);
			resolve();
		}));
	});
}

module.exports = {
	populateElasticWithVideos,
	createIndex
};