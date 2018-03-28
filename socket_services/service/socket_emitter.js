var dict = require('./emit_dict');

function createEmitFunction(toAssign, name, event_name) {
    toAssign[name] = (data, emitter) => {
        if(!emitter) {
            toAssign.emiter.emit(event_name, data)
        } else {
            console.log(data);
            console.log(emitter);
            emitter.emit(event_name, data);
        }
    }
}

class SocketEmitter {
    constructor(emiter){
        this.emiter = emiter;
        for(var key in dict){
            createEmitFunction(this, key, dict[key]);
        }
    }
}

module.exports = SocketEmitter;

