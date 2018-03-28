var dict = require('./listen_dict');

function createListenFunction(toAssign, name, event_name) {
    toAssign[name] = (callback) => toAssign.app.socket.on(event_name, (data) => callback.call(toAssign.app, data));
    toAssign['stop' + name.charAt(0).toUpperCase() + name.slice(1)] = () => toAssign.app.socket.removeAllListeners(event_name);
}

class SocketListener {

    constructor(app) {
        this.app = app;
        for(var key in dict) {
            createListenFunction(this, key, dict[key])
        }
    }
}

module.exports = SocketListener;

