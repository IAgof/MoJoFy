
const config = {
	
	// Server
	port: process.env.PORT || 3000,
	
	// JWT
	jwt_secret: 'secret',
	jwt_issuer: 'vimojo',

	// Datastore:
	ds_namespace: 'YOUR_NAMESPACE'
};

module.exports = config;
