var chat = require('./chat');
var utils = require('../utils');

var rooms_container = [];

class App {
    constructor(nsp, socket, namespace) {
        this.nsp = nsp;
        this.socket = socket;
        this.namespace = namespace;
    }

    authorize() {
        try {
            var token = this.socket.conn.request._query.auth_token;
            var user = utils.getUserFromToken(null, token);
            if(!user){
                this.socket.emit('error_msg', {
                    body: "User not found, or token expired"
                });
                this.socket.disconnect();
            }
        } catch(err) {
            this.socket.emit('error', err);
            this.socket.disconnect();
        }
        this.socket.nickname = user.sub;
        this.socket._id = user.id;
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

    enableLocalChatHandling() {
        if(this.room) {
            var self = this;
            this.socket.on('chat_msg_local', function (msg) {
                var owner = self.socket.nickname;
                self.nsp.to(self.room.id).emit('chat_msg_local', {
                    msg: msg,
                    owner: owner
                })
            });
        }
    }

    disableLocalChatHandling() {
        if(this.room) {
            this.socket.removeAllListeners('chat_msg_local');
        }
    }

    enableRoomCreation() {
        var self = this;
        this.socket.on('create_room', function (room_data) {
            self.createRoom(room_data);
        });
    }

    enableRoomJoining() {
        var self = this;
        this.socket.on('join_room' , function (room_id) {
            self.joinToRoom(room_id);
        });
    }

    enableRoomRequesting() {
        var self = this;
        this.socket.on('get_room_list', function (data) {
            self.socket.emit('room_list', rooms_container);
        })
    }

    disconnectHandlier() {
        var self = this;
        this.socket.on('disconnect', function() {
            console.log(self.socket.nickname + ' disconnected');
            self.leaveRoom();
        });
    }



    createRoom(room_data) {
        if(!this.room){
            this.room = Object.assign({}, room_data);
            this.room.users = [{
                socket: this.socket,
                nickname: this.socket.nickname
            }];
            this.room.id = this.socket._id;


            rooms_container.push(this.room);
            this.socket.join(this.room.id);
            this.enableLocalChatHandling();
            this.socket.emit('message', {msg: 'Your room has been created'});
            this.sendRoomList();
            this.sendUsersInRoom();
        } else {
            this.socket.emit('message', {msg: 'You actually own room!'});
        }
    }

    sendRoomList() {
        this.nsp.emit('room_list', rooms_container.map(function (room) {
            return {
                title: room.title,
                users: room.users.map((user)=> user.nickname),
                id: room.id
            };
        }));
    }

    joinToRoom(room_id) {
        if(this.room && room_id === this.room.id){
            this.socket.emit('message', {msg: 'You are already in this room'});
        } else {
            this.leaveRoom();
            var room = rooms_container.find((room) => room.id === room_id);
            if(room){
                room.users.push({
                    socket: this.socket,
                    nickname: this.socket.nickname
                });
                this.socket.join(room_id);
                this.room = room;
                this.socket.emit('message', {msg: 'Joined to room ' + room.title});
                this.enableLocalChatHandling();
                this.sendUsersInRoom();
            }
        }
    }

    sendUsersInRoom() {
        this.nsp.to(this.room.id).emit('room_users', this.room.users.map((user) => user.nickname));
    }

    leaveRoom() {
        var room = this.room;
        if(room) {
            if(room.id === this.socket._id) { //if u are room's owner
                rooms_container = rooms_container.filter((room) => room.id !== this.room.id, this);
                this.nsp.to(room.id).emit('destroy_room', {
                    room_id: room.id
                });
                this.disableLocalChatHandling();
                delete this.room;
                this.sendRoomList();
            } else {
                room.users = room.users.filter((user) => user.socket._id !== this.socket._id, this);
                this.socket.leave(room.id);
                this.disableLocalChatHandling();
                delete this.room;
            }
        }
    }

    run() {
        this.enableChatHandling();
    }
}

module.exports.App = App;
module.exports.rooms_container = rooms_container;
