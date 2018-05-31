const fs = require('fs');

// CONFIGS
const config = require('./config');

const aws = require('./components/aws');

let cloudStorage = aws;

// config.ds_emulator_host = 'http://localhost:8081';
// config.ds_namespace = 'VIMOJO_DEV';
// config.ds_projectId = 'videona-test';

const types = ['user', 'video', 'download-code'];

// RESULTS
const dump = {};

function readDatabase(callback) {
	config.persistence_db = 'datastore';
	for(let i = 0; i < types.length; i++) {
		const type = types[i];
		console.log(' - Listing ' + type + ' entities');
		const Store = require('./components/' + type + '/store');

		dump[type] = {};

		// Create a function to abstract store methods
		const list = (typeof Store.query !== 'undefined') ? Store.query : Store.list;

		// List all entities
		list({limit: 999}, function (list) {
			for (let j = 0; j < list.length; j++) {
				dump[type][list[j]._id] = list[j];
				// Link in some place the file url with entity type and id
				// ???
			}
			callback();
		});
	}
}

function dumpToFile() {
	var dumpString = JSON.stringify(dump);
	fs.writeFileSync('/app/db_dump.json', dumpString);
}

function dumpDatabase(callback) {
	config.persistence_db = 'dynamo';
	const read = require('/app/db_dump.json');

	for (let type in read) {

		const elems = read[type];
		const Store = require('./components/' + type + '/store');

		for (let key in elems) {
			const data = elems[key];
			data.id = key;

			Store.upsert(data, (response, id) => { console.log(); });
		}
	}

	callback();
}

function dumpFiles() {
	config.persistence_db = 'dynamo';

	const videoStore = require('./components/video/store');
	const userStore = require('./components/user/store');

	const read = require('/app/db_dump.json');

	for (let key in read.user) {
		let user = read.user[key];

		if (user.pic && typeof user.pic !== 'Object') {
			copyToS3('user/' + user.id, user.pic)
				.then(url => {
					user.pic = url;
					user.id = key;
					userStore.upsert(user, console.log);
				});
		}
	}

	for (let key in read.video) {
		let video = read.video[key];

		if (video.video && typeof video.video !== 'Object') {
			copyToS3(config.storage_folder.video, video.video)
				.then(url => {
					video.video = url;
					video.original = url;
					video.id = key;
					videoStore.upsert(video, console.log);
				});
		}
		if (video.poster && typeof video.poster !== 'Object') {
			copyToS3(config.storage_folder.poster, video.poster)
				.then(url => {
					video.poster = url;
					video.id = key;
					videoStore.upsert(video, console.log);
				});
		}
	}
}

function copyToS3(folder, url) {
	if (url.indexOf(config.local_cloud_storage_host + '/') === -1) {
		return Promise.reject();
	}

	let path = url.replace(config.local_cloud_storage_host + '/', '');
	let parts = path.replace('uploads/', '').split('.');
	let fileData = {
		path: path,
		extension: parts.pop(),
		filename: parts.join('.')
	};

	return aws.uploadToStorage(fileData, folder);
}

// STEP 1 - Read Database
// STEP 2 - Dump database data to a JSON file
//readDatabase(() => {
//    dumpToFile();
//});

// STEP 3 - Distribute wherever it's required
// STEP 4 - Upload files
dumpDatabase(() => {
	dumpFiles();
});