const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

const config = require('../../config');

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const jwt_issuer = config.jwt_issuer;
const auth0Audience = config.auth0_audience;

const checkJwt = jwt({
	// Dynamically provide a signing key
	// based on the kid in the header and
	// the signing keys provided by the JWKS endpoint.
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: `${jwt_issuer}.well-known/jwks.json`
	}),

	// Validate the audience and the issuer.
	audience: auth0Audience,
	issuer: jwt_issuer,
	algorithms: ['RS256'],
	credentialsRequired: false
});

module.exports = checkJwt;