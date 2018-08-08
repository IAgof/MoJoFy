process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const compositionStore = require('../../../../components/project/composition/store');
const compositionCtrl = require('../../../../components/project/composition');
const trackStore = require('../../../../components/project/track/store');
const assetCtrl = require('../../../../components/asset');

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
	describe('add', () => {
		beforeEach(removeAllCompositions);
		beforeEach(removeAllTracks);

		it('should create a composition', () => {
			const composition = {
				id: 'compositionId',
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
					return compositionCtrl.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(compositions[0]);
					console.log("expected ", composition);
					console.log("actual", compositions[0]);
					compositions[0].should.deep.equal(composition); // _id
				});
		});

		it('should assign a id if not present', () => {
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

		it('should assign a user if present', () => {
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

		it('should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
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

		it('should return created composition', () => {
			let createdComposition;
			const composition = {
				id: 'compositionId',
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
					delete compositions[0].creation_date;
					delete compositions[0].modification_date;
					console.log("expected ", createdComposition);
					console.log("actual", compositions[0]);
					compositions[0].should.deep.equal(createdComposition);
				});
		});

		it('should create a track if present', () => {
			let compositionId;
			const track = {
				id: 'trackId',
				position: 1,
				trackIndex: 2,
				volume: 0.5,
				muted: false
			};
			const composition = {
				id: 'compositionId',
				title: 'mycomposition',
				tracks: [
					track
				]
			};
			return compositionCtrl.add(composition)
				.then(result => new Promise(resolve => setTimeout(() => resolve(result), 500))) // TODO(jliarte): 18/07/18 wait since track creation is not chained
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					compositionId = createdComposition._id;
					return trackStore.list();
				})
				.then(tracks => {
					console.log("retrieved tracks are ", tracks);
					tracks.should.have.length(1);
					track.compositionId = compositionId;
					testUtil.prepareRetrievedEntityToCompare(tracks[0]);
					console.log("expected ", composition);
					console.log("actual", tracks[0]);
					tracks[0].should.deep.equal(track); // _id
				});
		});

	});

	describe('update', () => {
		beforeEach(removeAllCompositions);

		it('should update an existing composition', () => {
			let createdCompositionId;
			const composition = {
				title: 'mycomposition',
				description: 'desc',
			};
			const newCompositionData = {
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

			return compositionStore.add(composition)
				.then(id => {
					console.log("Composition created with id ", id);
					createdCompositionId = id;
					newCompositionData.id = createdCompositionId;
					return compositionCtrl.update(newCompositionData);
				})
				.then(updatedComposition => {
					console.log("res updating composition ", updatedComposition);
					return compositionCtrl.list();
				})
				.then(compositions => {
					compositions.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(compositions[0]);
					compositions[0].should.deep.equal(newCompositionData);
				})

		});

	});

	describe('list', () => {
		beforeEach(removeAllCompositions);
		// TODO(jliarte): 26/07/18 list composition - include a param for getting all composition details in cascade?

		it('should get all compositions', () => {
			const composition1 = {
				id: 'compositionId.1',
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
			const composition2 = {
				id: 'compositionId.2',
				title: 'mycomposition2',
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
			return compositionCtrl.add(composition1)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionCtrl.add(composition2);
				})
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionCtrl.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(2);
					testUtil.prepareRetrievedEntityToCompare(compositions[0]);
					testUtil.prepareRetrievedEntityToCompare(compositions[1]);
					compositions.should.deep.include(composition1);
					compositions.should.deep.include(composition2);
				});
		});

		it('should order compositions by modification_date', () => {
			const composition1 = {
				id: 'compositionId.1',
			};
			const days = 1;
			const composition2 = {
				id: 'compositionId.2',
			};
			return compositionStore.add(composition1)
				.then(result => new Promise(resolve => setTimeout(() => resolve(result), 500))) // (jliarte): 8/08/18 wait for composition2 modification date be 500ms greater than composition1
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.add(composition2);
				})
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionCtrl.list(undefined, { orderBy: 'modification_date' });
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(2);
					testUtil.prepareRetrievedEntityToCompare(compositions[0]);
					testUtil.prepareRetrievedEntityToCompare(compositions[1]);
					compositions[0].should.deep.equal(composition1);
					compositions[1].should.deep.equal(composition2);
					return compositionCtrl.list(undefined, { orderBy: '-modification_date' });
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(2);
					testUtil.prepareRetrievedEntityToCompare(compositions[0]);
					testUtil.prepareRetrievedEntityToCompare(compositions[1]);
					compositions[0].should.deep.equal(composition2);
					compositions[1].should.deep.equal(composition1);
				});
		});


	});

	describe('get', () => {
		beforeEach(removeAllCompositions);
		// TODO(jliarte): 26/07/18 get composition should retrieve all project info in cascade

		it('should get all composition elements with cascade param', () => {
			const media1Id = 'mediaId.1';
			const media2Id = 'mediaId.2';
			const asset1 = {
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId',
				// mediaId: media1Id // FIXME(jliarte): 27/07/18 assetCtrl is failing: TypeError: mediaCtrl.updateMediaAsset is not a function
			};
			const asset2 = {
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId',
				// mediaId: media2Id // FIXME(jliarte): 27/07/18 assetCtrl is failing: TypeError: mediaCtrl.updateMediaAsset is not a function
			};

			const media1 = {
				id:  media1Id,
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
				// asset: asset1
			};
			const media2 = {
				id:  media2Id,
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
				// asset: asset2
			};

			const track1 = {
				id: 'trackId.1',
				position: 0,
				trackIndex: 1,
				volume: 0.5,
				muted: false,
				medias: [media1, media2]
			};
			const track2 = {
				id: 'trackId.1',
				position: 1,
				trackIndex: 2,
				volume: 0.5,
				muted: true
			};

			const composition = {
				id: 'compositionId',
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
				created_by: 'userId',
				tracks: [ track1, track2 ]
			};
			return assetCtrl.add(asset1)
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					media1.assetId = createdAsset._id;
					return assetCtrl.add(asset2);
				})
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					media2.assetId = createdAsset._id;
					return compositionCtrl.add(composition);
				})
				.then(result => new Promise(resolve => setTimeout(() => resolve(result), 500)))
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionCtrl.get(composition.id);
				})
				.then(retrievedComposition => {
					console.log("retrieved composition is ", retrievedComposition);
					let plainComposition = Object.assign({}, composition);
					delete plainComposition.tracks;
					delete retrievedComposition.modification_date;
					delete retrievedComposition.creation_date;
					retrievedComposition.id = retrievedComposition._id;
					delete retrievedComposition._id;
					retrievedComposition.should.deep.equal(plainComposition);
					return compositionCtrl.get(retrievedComposition.id, true); // cascade = true
				})
				.then(retrievedComposition => {
					console.log("retrieved composition is ", retrievedComposition);
					retrievedComposition.should.have.property('tracks');
					retrievedComposition.tracks.should.have.length(2);
					const retrievedTrack1 = retrievedComposition.tracks.filter(item => item._id === track1.id)[0];
					retrievedTrack1.should.have.property('medias');
					retrievedTrack1.medias.should.have.length(2);
					console.log("track medias are ", retrievedTrack1.medias);
					const retrievedTrack1Media1 = retrievedTrack1.medias.filter(item => item._id === media1.id)[0];
					const retrievedTrack1Media2 = retrievedTrack1.medias.filter(item => item._id === media2.id)[0];
					console.log("track media1 ", retrievedTrack1Media1);
					console.log("track media2 ", retrievedTrack1Media2);
					retrievedTrack1Media1.should.have.property('asset');
					retrievedTrack1Media2.should.have.property('asset');
				});
		});

	});

});