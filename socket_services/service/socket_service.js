var Emitter = require('./socket_emitter');
var Listener = require('./socket_listener');
var utils = require('../../utils');

var user_container = [];

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
                this.emit.errorMsg("User not found, or token expired");
                return false;
            }
        } catch(err) {
            this.emit.errorMsg("User not found, or token expired");
            return false;
        }
        // var userApperance = Object.values(this.app.nsp.sockets).filter((socket)=> socket.nickname === user.sub && socket.id !== this.app.socket.id, this);

        this.app.nickname = user.sub;
        this.app._id = user.id;
        this.app.socket.nickname = user.sub;
        this.app.socket._id = user.id;

        var userApperance = user_container.filter((app)=> app._id === user.id);

        userApperance.map((app)=>{
            app.socketService.emit.errorMsg("Someone logged as you, disconnected");
            app.socketService.disconnect(true);
        });

        user_container.push(this.app);

        return true;

    }

    disconnect() {
        user_container = user_container.filter((user)=>this.app._id !== user._id, this);
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

    getUserList() {
        return user_container.map((user)=> {
            id: user._id
            nickname: user.nickname
        });
    }

}

module.exports.SocketService = SocketService;
module.exports.UserContainer = user_container;
