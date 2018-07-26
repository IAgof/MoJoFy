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
				mute: true,
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
			const track = {
			};
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
			const track = {
			};
			const user = { _id: 'userId' };
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
			const track = {
			};
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
				mute: true,
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
				id:  'media1Id',
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
				assetId: 'assetId.1'
			};
			const media2 = {
				id:  'media2Id',
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
				assetId: 'assetId.2'
			};
			let createdTrackId;
			const track = {
				id: 'trackId',
				medias: [ media1, media2 ]
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
					medias[0].id = medias[0]._id;
					delete medias[0]._id;
					delete medias[0].creation_date;
					delete medias[0].modification_date;
					media1.trackId = createdTrackId;
					medias[1].id = medias[1]._id;
					delete medias[1]._id;
					delete medias[1].creation_date;
					delete medias[1].modification_date;
					media2.trackId = createdTrackId;
					medias.should.deep.include(media1); // _id
					medias.should.deep.include(media2); // _id
				});
		});

	});

});