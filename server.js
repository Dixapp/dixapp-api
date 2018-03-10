'use strict';

var app = require('./index');
var http = require('http');

var server;

/*
 * Create and start HTTP server.
 */

server = http.createServer(app);

var io = require('socket.io')(server);
io.on('connection', function(socket){
    console.log("connected to socket");

});

var dixio = io.of('/dixio');
dixio.on('connection', function (socket) {
    var DixioUser = require('./socket_services/dixio').DixioUser;
    var dixioUser = new DixioUser(dixio, socket, 'dixio');
    dixioUser.authorize();
    dixioUser.enableChatHandling();
    dixioUser.enableRoomCreation();
    dixioUser.enableRoomRequesting();
    dixioUser.enableRoomJoining();
    dixioUser.disconnectHandlier();
    dixioUser.sendRoomList();

    // console.log(dixio.sockets);
    // console.log('---- \n\n\n')
   // for(var s in dixio.adapter.rooms['all_chat_dixio'].sockets){
   //     console.log(dixio.sockets[s].nickname);
   // }

});


server.listen(process.env.PORT || 8000);
server.on('listening', function () {
    console.log('Server listening on http://localhost:%d', this.address().port);
    console.log('Socket listening opened');
});
