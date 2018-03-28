var Emitter = require('./socket_emitter');
var Listener = require('./socket_listener');


class SocketService {

    constructor(app) {
        this.app = app;

        this.emit = new Emitter(this.app.socket);
        this.roomEmitter = new Emitter(null);
        this.nspEmitter = new Emitter(this.app.nsp);

        this.listen = new Listener(this.app);
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
