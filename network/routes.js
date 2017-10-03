/* jshint node: true */
const express = require('express');

const routes = function(server) {

	server.use('/', express.static('public'));
	server.use('/login', require('../components/access/network'));
	server.use('/user', require('../components/user/network'));
	// server.use('/resource', require('../components/resource/network'));

	return server;
};	

module.exports = routes;
