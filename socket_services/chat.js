module.exports.chathandler = function (nsp, socket, namespace) {
    socket.emit('message', {msg: 'Welcome '+socket.nickname+' to dixio chat'});
    socket.join('all_chat_'+namespace);
    nsp.to('all_chat'+namespace).emit('message', {msg: "Someone joined"});
};



class Chat {

    constructor(nsp, socket, namespace) {
        this.nsp = nsp;
        this.socket = socket;
        this.namespace = namespace;
    }


}


