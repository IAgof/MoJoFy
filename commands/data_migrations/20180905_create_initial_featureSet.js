const initialFeatures = require('./20180905_initial_featureSet');

const userFeatureCtrl = require('../../components/user/user-feature');

function addDefaultsFeatures() {
	const plans = initialFeatures.plans;
	const featureSet = initialFeatures.featureSet;
	const defaultUserId = 'default';

	for (let plan in initialFeatures.featureSet) {
		initialFeatures.featureSet[plan].forEach(feature => {
			feature.userId = defaultUserId;
			userFeatureCtrl.add(feature);
		});
	}
}

module.exports = {
	addDefaultsFeatures
};