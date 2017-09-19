
const config = {
	
	// Server
	port: process.env.PORT || 3000,
	
	// JWT
	jwt_secret: 'secret',
	jwt_issuer: 'vimojo'
};

module.exports = config;
