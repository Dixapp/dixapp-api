
class ChatApp {

    constructor(nsp, socket, namespace) {
        this.nsp = nsp;
        this.socket = socket;
        this.namespace = namespace;
    }

    initialize() {
        this.enableChatHandling();
    }

    enableChatHandling() {
        this.socket.join('all_chat_'+this.namespace);

        this.nsp.to('all_chat_'+this.namespace).emit('chat_msg_global', {
            msg: this.socket.nickname+" joined to "+this.namespace,
            owner: 'server'
        });

        var self = this;
        this.socket.on('chat_msg_global', function (msg) {
            var owner = self.socket.nickname;
            self.nsp.to('all_chat_'+self.namespace).emit('chat_msg_global', {
                msg: msg,
                owner: owner
            });
        });
    }

    enableLocalChatHandling(room) {
        if(room) {
            var self = this;
            this.socket.on('chat_msg_local', function (msg) {
                var owner = self.socket.nickname;
                self.nsp.to(room.id).emit('chat_msg_local', {
                    msg: msg,
                    owner: owner
                })
            });
        }
    }

    disableLocalChatHandling() {
        this.socket.removeAllListeners('chat_msg_local');
    }
}

module.exports.ChatApp = ChatApp;
