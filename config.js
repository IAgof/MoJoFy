
const config = {
	
	// Server
	port: process.env.PORT || 3000,

	//
	logLevel: String(process.env.BACKEND_WINSTON_LOG_LEVEL) || info,

	//
	upload_folder: 'uploads/',
	
	// JWT
	jwt_secret: 'secret',
	jwt_issuer: 'issuer',
	jwt_expires: '1y',		// Format guide: https://github.com/zeit/ms

	// Datastore:
	ds_emulator_host: process.env.DATASTORE_EMULATOR_HOST,
	ds_namespace: process.env.BACKEND_DATASTORE_NAMESPACE,
	ds_projectId: process.env.BACKEND_GOOGLE_CLOUD_PROJECT_ID,
	ds_keyFilename: 'datastore-key.json',

	// Cloud Storage:
	cloud_storage: process.env.BACKEND_CLOUD_STORAGE_TYPE,
	storage_accessId: 'YOUR-CLIENT-ACCESS-ID@developer.gserviceaccount.com',
	storage_keyFilename: './cloud-storage-key.pem',
	storage_bucket: 'YOUR-BUCKET-NAME',
	storage_folder: {
		image: 'image',
		video: 'video'
	},

	// Sendgrid
	sendgridApiKey: process.env.SENDGRID_API_KEY,

	// Email notifications:
	emailNotificationsRecipient: process.env.BACKEND_EMAIL_NOTIFICATIONS_RECEIVER,
	emailNotificationsSender: process.env.BACKEND_EMAIL_NOTIFICATIONS_SENDER,
};

module.exports = config;
