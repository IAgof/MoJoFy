const Model = require('./model');

const productTypes = [
	Model.set({productType: 'LIVE_ON_TAPE'}),
	Model.set({productType: 'B_ROLL'}),
	Model.set({productType: 'NAT_VO'}),
	Model.set({productType: 'INTERVIEW'}),
	Model.set({productType: 'GRAPHICS'}),
	Model.set({productType: 'PIECE'})
];

function list() {
// TODO(jliarte): harcoded by now, implement model retrieval when product types will be managed by admin
	return new Promise(resolve => {
		resolve(productTypes);
	});
}

module.exports = {
	list
};
