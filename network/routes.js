/* jshint node: true */
const express = require('express');

const routes = function(server) {

	const component = function(name) { return '../components/'+ name +'/network'; };

	server.use('/', express.static('public'));
	server.use('/login', require(component('access')));
	server.use('/user', require(component('user')));
	// server.use('/static', require(component('files')));
	server.use('/video', require(component('video')));
	// server.use('/resource', require('../components/resource/network'));

	return server;
};	

module.exports = routes;
