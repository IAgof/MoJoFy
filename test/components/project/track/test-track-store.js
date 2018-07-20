process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const trackStore = require('../../../../components/project/track/store');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllTracks() {
	return testUtil.removeAllEntities('track');
}

describe('Track store', () => {
	describe('upsert', () => {
		beforeEach(removeAllTracks);

		it('it should create a track', () => {
			const track = {
				id: 'trackId',
				trackIndex: 0,
				volume: 0.4,
				mute: true,
				position: 1,
				compositionId: 'compositionId',
				created_by: 'userId'
			};
			return trackStore.upsert(track)
				.then(createdTrackId => {
					console.log("track created id", createdTrackId);
					createdTrackId.should.equal(track.id);
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					delete tracks[0]._id;
					delete track.id;
					delete tracks[0].creation_date;
					delete tracks[0].modification_date;
					console.log("expected ", track);
					console.log("actual", tracks[0]);
					tracks[0].should.deep.equal(track); // _id
				});
		});

		it('it should assign a id if not provided', () => {
			const track = {
				positoin: 0,
			};
			return trackStore.upsert(track)
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

		it('it should set creation and modification date on a new track', () => {
			const track = {
				position: 0,
			};
			return trackStore.upsert(track)
				.then(createdTrack => {
					console.log("track created ", createdTrack);
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					delete tracks[0]._id;
					tracks[0].should.have.property("creation_date");
					tracks[0].should.have.property("modification_date");
				});
		});

	});

});