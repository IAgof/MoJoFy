process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const trackStore = require('../../../../components/project/track/store');
const trackCtrl = require('../../../../components/project/track');
const mediaStore = require('../../../../components/project/media/store');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllTracks() {
	return testUtil.removeAllEntities('track');
}

function removeAllMedias() {
	return testUtil.removeAllEntities('media');
}

describe('Track controller', () => {
	describe('add', () => {
		beforeEach(removeAllTracks);
		beforeEach(removeAllMedias);

		it('should create a track', () => {
			const track = {
				id: 'trackId',
				trackIndex: 0,
				volume: 0.4,
				muted: true,
				position: 1,
				compositionId: 'compositionId',
				created_by: 'userId'
			};
			return trackCtrl.add(track)
				.then(createdTrack => {
					console.log("track created ", createdTrack);
					return trackCtrl.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					tracks[0].id = tracks[0]._id;
					delete tracks[0]._id;
					delete tracks[0].creation_date;
					delete tracks[0].modification_date;
					console.log("expected ", track);
					console.log("actual", tracks[0]);
					tracks[0].should.deep.equal(track); // _id
				});
		});

		it('should assign a id if not present', () => {
			const track = {};
			return trackCtrl.add(track)
				.then(createdTrack => {
					console.log("track created ", createdTrack);
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					tracks[0].should.have.property('_id');
				});
		});

		it('should assign a user if present', () => {
			const track = {};
			const user = {_id: 'userId'};
			return trackCtrl.add(track, user)
				.then(createdTrack => {
					console.log("track created ", createdTrack);
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					tracks[0].should.have.property('created_by');
					tracks[0]['created_by'].should.equal(user._id);
				});
		});

		it('should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
			const track = {};
			return trackCtrl.add(track)
				.then(createdTrack => {
					console.log("track created ", createdTrack);
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					tracks[0].should.not.have.property('created_by');
				});
		});

		it('should return created track', () => {
			let createdTrack;
			const track = {
				id: 'trackId',
				trackIndex: 0,
				volume: 0.4,
				muted: true,
				position: 1,
				compositionId: 'compositionId',
				created_by: 'userId'
			};
			return trackCtrl.add(track)
				.then(result => {
					console.log("track created ", result);
					createdTrack = result;
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					delete tracks[0].creation_date;
					delete tracks[0].modification_date;
					console.log("expected ", createdTrack);
					console.log("actual", tracks[0]);
					tracks[0].should.deep.equal(createdTrack); // _id
				});
		});

		it('should create medias if present', () => {
			let createdTrack;
			const media1 = {
				id: 'media1Id',
				mediaType: 'video',
				position: 0,
				mediaPath: 'media/1/path',
				volume: 0.2,
				remoteTempPath: 'remote/1/path',
				clipText: '',
				clipTextPosition: '',
				hasText: false,
				trimmed: false,
				startTime: 0,
				stopTime: 120980,
				videoError: '',
				transcodeFinished: false,
        title: 'media1 title',
				assetId: 'assetId.1'
			};
			const media2 = {
				id: 'media2Id',
				mediaType: 'video',
				position: 0,
				mediaPath: 'media/1/path',
				volume: 0.2,
				remoteTempPath: 'remote/1/path',
				clipText: '',
				clipTextPosition: '',
				hasText: false,
				trimmed: false,
				startTime: 0,
				stopTime: 120980,
				videoError: '',
				transcodeFinished: false,
        title: 'media2 title',
				assetId: 'assetId.2'
			};
			let createdTrackId;
			const track = {
				id: 'trackId',
				medias: [media1, media2]
			};
			return trackCtrl.add(track)
				.then(result => new Promise(resolve => setTimeout(() => resolve(result), 500))) // TODO(jliarte): 18/07/18 wait since media creation is not chained
				.then(result => {
					console.log("track created ", result);
					createdTrack = result;
					return trackStore.list();
				})
				.then(tracks => {
					tracks.should.have.length(1);
					createdTrackId = tracks[0]._id;
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(2);
					testUtil.prepareRetrievedEntityToCompare(medias[0]);
					media1.trackId = createdTrackId;
					testUtil.prepareRetrievedEntityToCompare(medias[1]);
					media2.trackId = createdTrackId;
					medias.should.deep.include(media1); // _id
					medias.should.deep.include(media2); // _id
				});
		});

	});

	describe('query', () => {
		beforeEach(removeAllTracks);

		it('should return track with compositionId filter', () => {
			const track = {
				id: 'trackId',
				trackIndex: 0,
				volume: 0.4,
				muted: true,
				position: 1,
				compositionId: 'compositionId',
				created_by: 'userId'
			};
			return trackStore.add(track)
				.then(res => {
					console.log("created track res ", res);
					return trackCtrl.query({track: {compositionId: track.compositionId}});
				})
				.then(tracks => {
					console.log("retrieved tracks are: ", tracks);
					tracks.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(tracks[0]);
					tracks[0].should.deep.equal(track);
					return trackCtrl.query({track: {compositionId: 'notfound'}});
				})
				.then(tracks => {
					console.log("retrieved tracks are: ", tracks);
					tracks.should.have.length(0);
				});
		});

		it('should return track with compositionId filter and corresponding medias if cascade', () => {
			const media1 = {
				id: 'media1Id',
				mediaType: 'video',
				position: 0,
				mediaPath: 'media/1/path',
				volume: 0.2,
				remoteTempPath: 'remote/1/path',
				clipText: '',
				clipTextPosition: '',
				hasText: false,
				trimmed: false,
				startTime: 0,
				stopTime: 120980,
				videoError: '',
				transcodeFinished: false,
        title: "media1 title",
				assetId: 'assetId.1'
			};
			const media2 = {
				id: 'media2Id',
				mediaType: 'video',
				position: 0,
				mediaPath: 'media/1/path',
				volume: 0.2,
				remoteTempPath: 'remote/1/path',
				clipText: '',
				clipTextPosition: '',
				hasText: false,
				trimmed: false,
				startTime: 0,
				stopTime: 120980,
				videoError: '',
				transcodeFinished: false,
        title: "media2 title",
        assetId: 'assetId.2'
			};
			const track = {
				id: 'trackId',
				trackIndex: 0,
				volume: 0.4,
				muted: true,
				position: 1,
				compositionId: 'compositionId',
				created_by: 'userId',
				medias: [media1, media2]
			};
			return trackCtrl.add(track)
				.then(result => new Promise(resolve => setTimeout(() => resolve(result), 500)))
				.then(res => {
					console.log("created track res ", res);
					return trackCtrl.query({track: {compositionId: track.compositionId}, cascade: true});
				})
				.then(tracks => {
					console.log("retrieved tracks are: ", tracks);
					tracks.should.have.length(1);

					tracks[0].should.have.property('medias');
					tracks[0].medias.should.have.length(2);

					const retrievedMedia1 = tracks[0].medias.filter(item => item._id === media1.id)[0];
					testUtil.prepareRetrievedEntityToCompare(retrievedMedia1);
					retrievedMedia1.should.deep.equal(media1);
					const retrievedMedia2 = tracks[0].medias.filter(item => item._id === media2.id)[0];
					testUtil.prepareRetrievedEntityToCompare(retrievedMedia2);
					retrievedMedia2.should.deep.equal(media2);

					return trackCtrl.query({track: {compositionId: 'notfound'}});
				})
				.then(tracks => {
					console.log("retrieved tracks are: ", tracks);
					tracks.should.have.length(0);
				});
		});


	});

	describe('get', () => {
		beforeEach(removeAllTracks);
		beforeEach(removeAllMedias);

		it('should get all medias elements with cascade param', () => {
			const media1 = {
				id: 'media1Id',
			};
			const media2 = {
				id: 'media2Id',
			};
			const track = {
				id: 'trackId',
				medias: [media1, media2]
			};
			return trackCtrl.add(track)
				.then(result => new Promise(resolve => setTimeout(() => resolve(result), 500))) // TODO(jliarte): 18/07/18 wait since media creation is not chained
				.then(createdTrack => {
					console.log("track created ", createdTrack);
					return trackCtrl.get(track.id, true);
				})
				.then(retrievedTrack => {
					console.log("retrieved track ", retrievedTrack);
					retrievedTrack.should.have.property('medias');
					retrievedTrack.medias.should.have.length(2);
					retrievedTrack.medias[0]._id.should.equal(media1.id);
					retrievedTrack.medias[1]._id.should.equal(media2.id);
				});
		});

	});

	describe('remove', () => {
		beforeEach(removeAllTracks);
		beforeEach(removeAllMedias);

		it('should remove track and its medias if cascade', () => {
			const media1 = {
				id: 'media1Id',
			};
			const media2 = {
				id: 'media2Id',
			};
			let createdTrackId;
			const track = {
				id: 'trackId',
				medias: [media1, media2]
			};
			return trackCtrl.add(track)
				.then(result => new Promise(resolve => setTimeout(() => resolve(result), 500))) // TODO(jliarte): 18/07/18 wait since media creation is not chained
				.then(createdTrackId => {
					console.log("track created id", createdTrackId);
					return trackStore.list()
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					return mediaStore.list();
				})
				.then(medias => {
					medias.should.have.length(2);
					return trackCtrl.remove(track.id, true); // cascade = true
				})
				.then(res => {
					console.log("Result removing track ", res);
					return trackStore.list();
				})
				.then(tracks => {
					tracks.should.have.length(0);
					return mediaStore.list();
				})
				.then(medias => {
					medias.should.have.length(0);
				});
		});
	});


});