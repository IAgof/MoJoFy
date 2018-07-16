process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const compositionStore = require('../../../../components/project/composition/store');
const compositionCtrl = require('../../../../components/project/composition');
const trackStore = require('../../../../components/project/track/store');
const config = require('../../../../config');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllCompositions() {
	return testUtil.removeAllEntities('composition');
}

function removeAllTracks() {
	return testUtil.removeAllEntities('track');
}

describe('Composition controller', () => {
	/*
		* Test project store
		*/
	describe('add', () => {
		beforeEach(removeAllCompositions);
		beforeEach(removeAllTracks);
		// afterEach(removeAllProjects);

		it('it should create a composition', () => {
			const composition = {
				// id: 'compositionId',
				uuid: 'compositionId',
				title: 'mycomposition',
				description: 'desc',
				remoteProjectPath: 'remote/prj/path',
				quality: 'poor',
				resolution: 'fhd',
				frameRate: '30',
				duration: 42,
				audioFadeTransitionActivated: true,
				videoFadeTransitionActivated: false,
				watermarkActivated: true,
				productType: 'p1,p2',
				poster: 'poster/parh',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return compositionCtrl.add(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					if (config.persistence_db != 'datastore') {
						compositions[0].id = compositions[0]._id;
					}
					delete composition.id;
					delete compositions[0]._id;
					delete compositions[0].creation_date;
					delete compositions[0].modification_date;
					console.log("expected ", composition);
					console.log("actual", compositions[0]);
					compositions[0].should.deep.equal(composition); // _id
				});
		});

		it('it should assign a id if not present', () => {
			const composition = {
			};
			return compositionCtrl.add(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					compositions[0].should.have.property('_id');
				});
		});

		it('it should assign a user if present', () => { // TODO(jliarte): 14/07/18 change to throw error?
			const composition = {
			};
			const user = { _id: 'userId' };
			return compositionCtrl.add(composition, user)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					compositions[0].should.have.property('created_by');
					compositions[0]['created_by'].should.equal(user._id);
				});
		});

		it('it should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
			const composition = {
			};
			return compositionCtrl.add(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					compositions[0].should.not.have.property('created_by');
				});
		});

		it('it should return created composition', () => {
			let createdComposition;
			const composition = {
				id: 'compositionId',
				uuid: 'compositionId',
				title: 'mycomposition',
				description: 'desc',
			};
			return compositionCtrl.add(composition)
				.then(result => {
					console.log("composition created ", result);
					createdComposition = result;
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					if (config.persistence_db != 'datastore') {
						compositions[0].id = compositions[0]._id;
					}
					delete compositions[0].creation_date;
					delete compositions[0].modification_date;
					console.log("expected ", createdComposition);
					console.log("actual", compositions[0]);
					compositions[0].should.deep.equal(createdComposition); // _id
				});
		});

		it('it should create a track if present', () => {
			let compositionId;
			const track = {
				uuid: 'trackIndex',
				position: 1,
				trackIndex: 2,
				volume: 0.5,
				mute: false
			};
			const composition = {
				uuid: 'compositionId',
				title: 'mycomposition',
				tracks: [
					track
				]
			};
			return compositionCtrl.add(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					compositionId = createdComposition._id;
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					track.compositionId = compositionId;
					delete tracks[0]._id;
					delete tracks[0].creation_date;
					delete tracks[0].modification_date;
					console.log("expected ", composition);
					console.log("actual", tracks[0]);
					tracks[0].should.deep.equal(track); // _id
				});
		});

	});

});