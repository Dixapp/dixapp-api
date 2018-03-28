'use strict';

var app = require('./index');
var http = require('http');
var CAHApp = require('./socket_services/dixio').CAHApp;

var server;

/*
 * Create and start HTTP server.
 */

server = http.createServer(app);

var io = require('socket.io')(server);
io.on('connection', function(socket){
});

var dixio = io.of('/dixio');
dixio.on('connection', function (socket) {
    var cahUser = new CAHApp(dixio, socket, 'dixio');
    cahUser.initialize();
});




server.listen(process.env.PORT || 8000);
server.on('listening', function () {
    console.log('Server listening on http://localhost:%d', this.address().port);
    console.log('Socket listening opened');
});
