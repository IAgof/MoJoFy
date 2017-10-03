
const config = {
	
	// Server
	port: process.env.PORT || 3000,
	
	// JWT
	jwt_secret: 'secret',
	jwt_issuer: 'issuer',
	jwt_expires: '1y',		// Format guide: https://github.com/zeit/ms

	// Datastore:
	ds_namespace: 'YOUR_NAMESPACE',
	ds_projectId: 'GOOGLE-CLOUD-PROJECT-ID',
	ds_keyFilename: 'datastore-key.json'
};

module.exports = config;
