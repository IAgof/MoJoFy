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
			return elastic._client.indices.create({ index: config.elastic_index })
		}
	}

	return elastic._client.indices.exists({ index: config.elastic_index })
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

function updateLocalCloudVideoIP(video, oldIP, newIp) {
	video.poster = video.poster.replace(oldIP, newIp);
	video.original = video.original.replace(oldIP, newIp);
	video.video = video.video.replace(oldIP, newIp);
	// console.log(video)
	videoStore.upsert(video, data => console.log("Updated video"));
}

function updateLocalCloudIP(oldIP, newIp) {
	return new Promise(resolve => {
		videoStore.listPersistence({}, (videos => {
			console.log("Updating localcloud ip from %s to %s to %d videos", oldIP, newIp, videos.length);
			videos.forEach(video => updateLocalCloudVideoIP(video, oldIP, newIp));
			resolve();
		}));
	});
}

function featureVideo(videoId) {
	return new Promise(resolve => {
		videoStore.get(videoId, (video => {
			console.log("Featuring video %d", videoId);
			video.tag = 'featured';
			delete video.date;
			resolve(videoStore.upsert(video, data => console.log("done!")));
		}));
	});
}

module.exports = {
	populateElasticWithVideos,
	createIndex,
	updateLocalCloudIP,
	featureVideo
};