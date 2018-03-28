var Emitter = require('./socket_emitter');
var Listener = require('./socket_listener');
var utils = require('../../utils');


class SocketService {

    constructor(app) {
        this.app = app;

        this.emit = new Emitter(this.app.socket);
        this.roomEmitter = new Emitter(null);
        this.nspEmitter = new Emitter(this.app.nsp);

        this.listen = new Listener(this.app);
    }

    authorize() {
        try {
            var token = this.app.socket.conn.request._query.auth_token;
            var user = utils.getUserFromToken(null, token);
            if(!user){
                this.emit.errorMsg({
                    body: "User not found, or token expired"
                });
                return false;
            }
        } catch(err) {
            this.emit.error('error', err);
            return false;
        }
        if(!Object.values(this.app.nsp.sockets).find((socket)=> socket.nickname === user.sub && socket.id !== this.app.socket.id, this)){
            this.app.nickname = user.sub;
            this.app._id = user.id;
            this.app.socket.nickname = user.sub;
            this.app.socket._id = user.id;
            return true;
        } else {
            return false;
        }
    }

    disconnect() {
        this.app.socket.disconnect();
    }

    toNsp() {
        return this.nspEmitter;
    }

    toRoom() {
        this.roomEmitter.emiter = this.app.nsp.to(this.app.room.id);
        return this.roomEmitter;
    }
}

module.exports.SocketService = SocketService;
