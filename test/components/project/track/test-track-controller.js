process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const trackStore = require('../../../../components/project/track/store');
const trackCtrl = require('../../../../components/project/track');
const config = require('../../../../config');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllTracks() {
	return testUtil.removeAllEntities('track');
}

describe('Track controller', () => {
	describe('add', () => {
		beforeEach(removeAllTracks);

		it('it should create a track', () => {
			const track = {
				// id: 'trackId',
				uuid: 'trackId',
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
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					if (config.persistence_db != 'datastore') {
						tracks[0].id = tracks[0]._id;
					}
					delete track.id;
					delete tracks[0]._id;
					delete tracks[0].creation_date;
					delete tracks[0].modification_date;
					console.log("expected ", track);
					console.log("actual", tracks[0]);
					tracks[0].should.deep.equal(track); // _id
				});
		});

		it('it should assign a id if not present', () => {
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

		it('it should assign a user if present', () => {
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

		it('it should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
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

		it('it should return created track', () => {
			let createdTrack;
			const track = {
				id: 'trackId',
				uuid: 'trackId',
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
					if (config.persistence_db != 'datastore') {
						tracks[0].id = tracks[0]._id;
					}
					delete tracks[0].creation_date;
					delete tracks[0].modification_date;
					console.log("expected ", createdTrack);
					console.log("actual", tracks[0]);
					tracks[0].should.deep.equal(createdTrack); // _id
				});
		});

	});

});