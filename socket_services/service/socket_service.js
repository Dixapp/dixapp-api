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
        var userApperance = Object.values(this.app.nsp.sockets).filter((socket)=> socket.nickname === user.sub && socket.id !== this.app.socket.id, this);

        this.app.nickname = user.sub;
        this.app._id = user.id;
        this.app.socket.nickname = user.sub;
        this.app.socket._id = user.id;

        userApperance.map((socket)=>{
            socket.disconnect(true);
        });

        return true;

    }

    disconnect() {
        this.app.socket.disconnect();
    }

    toNsp() {
        return this.nspEmitter;
    }

    join(room_id){
        this.app.socket.join(room_id);
    }

    leave(room_id){
        this.app.socket.leave(room_id);
    }

    toRoom() {
        this.roomEmitter.emiter = this.app.nsp.to(this.app.room.id);
        return this.roomEmitter;
    }
}

module.exports.SocketService = SocketService;
