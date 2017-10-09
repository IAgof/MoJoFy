
const config = {
	
	// Server
	port: process.env.PORT || 3000,

	//
	upload_folder: 'uploads/',
	
	// JWT
	jwt_secret: 'secret',
	jwt_issuer: 'issuer',
	jwt_expires: '1y',		// Format guide: https://github.com/zeit/ms

	// Datastore:
	ds_namespace: 'YOUR-NAMESPACE',
	ds_projectId: 'GOOGLE-CLOUD-PROJECT-ID',
	ds_keyFilename: 'datastore-key.json',

	// Cloud Storage:
	storage_accessId: 'YOUR-CLIENT-ACCESS-ID@developer.gserviceaccount.com',
	storage_keyFilename: './cloud-storage-key.pem',
	storage_bucket: 'YOUR-BUCKET-NAME',
	storage_folder: {
		image: 'image',
		video: 'video'
	}
};

module.exports = config;
