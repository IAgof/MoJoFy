
const config = {
	
	// Server
	port: process.env.PORT || 3000,

	//
	logLevel: String(process.env.BACKEND_WINSTON_LOG_LEVEL) || 'info',

	//
	upload_folder: 'uploads/',
	max_video_upload_byte_size: process.env.MAX_VIDEO_UPLOAD_BYTE_SIZE || '1500000',
	max_profile_upload_byte_size: process.env.MAX_PROFILE_UPLOAD_BYTE_SIZE || '1500000',
	
	// JWT
	jwt_secret: process.env.JWT_SECRET || 'secret',
	jwt_expires: process.env.JWT_TOKEN_EXPIRATION || '1y',		// Format guide: https://github.com/zeit/ms
	jwt_issuer: process.env.JWT_ISSUER,
	auth0_audience: process.env.AUTH0_AUDIENCE,
	auth0_metadata_ns: process.env.AUTH0_METADATA_NS,


// Databases
	persistence_db: process.env.BACKEND_PERSISTENT_DB || 'datastore',
	search_db: process.env.BACKEND_SEARCH_DB || 'elasticsearch',
	db_table_prefix: process.env.DB_TABLE_PREFIX || 'tableprefix',

	// Datastore:
	ds_emulator_host: process.env.DATASTORE_EMULATOR_HOST,
	ds_namespace: process.env.BACKEND_DATASTORE_NAMESPACE,
	ds_projectId: process.env.BACKEND_GOOGLE_CLOUD_PROJECT_ID,
	ds_keyFilename: 'datastore-key.json',

	// 'Elsasticsearch'
	elastic_index: process.env.ELASTIC_INDEX || 'test',
	elastic_user: process.env.ELASTIC_USER || 'elastic',
	elastic_pass: process.env.ELASTIC_PASS || 'changeme',
	elastic_host: process.env.ELASTIC_HOST || 'localhost',
	elastic_port: process.env.ELASTIC_PORT || '9200',
	elastic_log: process.env.ELASTIC_LOG || ['error', 'info'],

	// Cloud Storage:
	cloud_storage: process.env.BACKEND_CLOUD_STORAGE_TYPE,
	storage_accessId: process.env.STORAGE_ACCESS_ID || 'YOUR-CLIENT-ACCESS-ID@developer.gserviceaccount.com',
	storage_keyFilename: process.env.STORAGE_KEY || 'YOUR-STORAGE-KEY',
	storage_bucket: process.env.STORAGE_BUCKET || 'YOUR-BUCKET-NAME',
	storage_folder: {
		image: 'image',
		video: 'video',
		poster: 'poster',
		user: 'user',
		asset: 'assets'
	},
	
	frontend_url: process.env.FRONTEND_URL,
	
	// LocalCloudStorage
	local_cloud_storage_host: process.env.LOCAL_CLOUD_STORAGE_HOST,

	// Sendgrid
	sendgridApiKey: process.env.SENDGRID_API_KEY,

	// Flavour
	flavour: process.env.FLAVOUR || 'vimojo',

	// Email notifications:
	emailNotificationsRecipient: process.env.BACKEND_EMAIL_NOTIFICATIONS_RECEIVER,
	emailNotificationsSender: process.env.BACKEND_EMAIL_NOTIFICATIONS_SENDER,

	// Show only published videos in video lists
	showOnlyPublishedVideos: true,
	
	// AWS
	aws_secretKey: process.env.AWS_SECRET || 'YOUR-SECRET-KEY',
	aws_accessKey: process.env.AWS_ACCESS_KEY || 'YOUR-ACCESS-KEY',
	aws_region: process.env.AWS_REGION || 'YOUR-REGION',
	cdn_path: process.env.CDN_PATH || 'YOUR-CLOUDFRONT-URL'
};

module.exports = config;
