const initialFeatureSet = require('./20180905_initial_featureSet');

const productSet = [
	{
		id: initialFeatureSet.FREE_PRODUCT_NAME,
		productName: 'Free',
		description: 'Vimojo Free',
		monthlyPrice: 0,
		// yearlyPrice: 0,
		discount: 0,
		valueOrder: 0,
	},
	{
		id: initialFeatureSet.WITNESS_PRODUCT_NAME,
		productName: 'Witness',
		description: 'Vimojo Witness SaaS product',
		monthlyPrice: 4.79,
		// yearlyPrice: 57.48,
		discount: 0.1,
		valueOrder: 10,
	},
	{
		id: initialFeatureSet.JOURNALIST_PRODUCT_NAME,
		productName: 'Journalist',
		description: 'Vimojo Journalist SaaS product',
		monthlyPrice: 9.79,
		// yearlyPrice: 0,
		discount: 0.2,
		valueOrder: 20,
	},
	{
		id: initialFeatureSet.HERO_PRODUCT_NAME,
		productName: 'Hero',
		description: 'Vimojo Hero SaaS product',
		monthlyPrice: 84,
		// yearlyPrice: 0,
		discount: 0.2,
		valueOrder: 30,
	},
	{
		id: initialFeatureSet.FREE_PLAN_NAME,
		productName: 'Super Hero',
		description: 'Vimojo Super Hero SaaS product',
		monthlyPrice: 149,
		// yearlyPrice: 0.2,
		discount: 0.3,
		valueOrder: 40,
	}
];

for (let idx in productSet) { // TODO(jliarte): 1/10/18 multiply per 12 and include discount
	productSet[idx].yearlyPrice = productSet[idx].monthlyPrice * 12 / (1 - productSet[idx].discount);
	productSet[idx].yearlyPrice = productSet[idx].yearlyPrice.toFixed(2);
}

module.exports = {
	productSet
};