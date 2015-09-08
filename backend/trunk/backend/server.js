/**
*	Módulos
*/
var http = require('http'),
	conf = require('./conf'),
	expressServer = require('./app/expressServer'),
	socketIO = require('./app/socketIO');

/**
*	variables locales
*/
var app = new expressServer();
var server = http.createServer(app.expressServer);
var Io = new socketIO({server: server});

// se pone el servidor en escucha
server.listen(conf.port, function () {
	console.log('Server running *: %s', conf.port);
});