var chat = require('./chat');
var App = require('./socket_app').App;

module.exports.dixiohandler = function (nsp, socket, namespace) {
    socket.emit('message', {msg: 'Welcome do dixio'});
    chat.chathandler(nsp, socket, namespace);
};

class DixioUser extends App {}

module.exports.DixioUser = DixioUser;
