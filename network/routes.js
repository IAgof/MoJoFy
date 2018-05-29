/* jshint node: true */
const express = require('express');

const routes = function (server) {

	const component = function (name) { return '../components/'+ name +'/network'; };

	server.use('/', express.static('public'));
	server.use('/login', require(component('access')));
	server.use('/user', require(component('user')));
	// server.use('/static', require(component('files')));
	server.use('/video', require(component('video')));
	server.use('/client', require(component('client')));
	server.use('/distribute', require(component('distribute')));
	// server.use('/resource', require('../components/resource/network'));

	// nested routes
	require(component('user')).use('/:userId/video', require(component('video')));
	require(component('video')).use('/product_type', require(component('product_type')));
	require(component('video')).use('/lang', require(component('video_lang')));
	require(component('video')).use('/category', require(component('video_category')));

	return server;
};

module.exports = routes;
