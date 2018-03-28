var ChatApp = require('./chat_app').ChatApp;
var RoomApp = require('./room_app').RoomApp;
var _ = require('lodash');
var SocketService = require('./service/socket_service').SocketService;

var rooms_container = [];

class App {
    constructor(nsp, socket, namespace) {
        this.nsp = nsp;
        this.socket = socket;
        this.namespace = namespace;
        this.socketService = new SocketService(this);
        this.chat = new ChatApp(nsp, socket, namespace);
    }

    initialize() {
        if(this.socketService.authorize()){
            this.chat.initialize();
            this.enableRoomCreation();
            this.enableRoomJoining();
            this.enableRoomLeaving();
            this.disconnectHandlier();
            this.sendRoomList();
            this.socketService.emit.roomInfo(null);
        } else {
            this.socketService.emit.errorMsg("You have to leave");
            this.socketService.disconnect();
        }
    }

    enableRoomCreation() {
        this.socketService.listen.roomCreation((data)=> this.createRoom(data));
    }

    enableRoomJoining() {
        this.socketService.listen.roomJoining((room_id) => this.joinToRoom(room_id));
    }

    enableRoomLeaving() {
        this.socketService.listen.roomLeaving(() => this.leaveRoom());
    }

    disconnectHandlier() {
        this.socketService.listen.disconnect(()=> this.leaveRoom());
    }

    sendRoomList() {
        this.socketService.toNsp().roomList(rooms_container.map((room) => room.getInfo(), this));
    }

    createRoom(room_data) {
        if(!this.room){
            this.room = new RoomApp(this, room_data);
            rooms_container.push(this.room);
            this.chat.enableLocalChatHandling(this.room);
            this.room.sendInfoToAll();
            this.sendRoomList();
            this.socketService.emit.message({msg: 'Your room has been created'});
            return true;
        } else {
            this.socketService.emit.message({msg: 'You actually own room!'});
            return false;
        }
    }

    joinToRoom(room_id) {
        if(this.room && room_id === this.room.id){
            this.socketService.emit.message({msg: 'You are already in room'});
            return false;
        } else {
            this.leaveRoom();
            var room = rooms_container.find((room) => room.id === room_id);
            if(room){
                room.join(this);
                this.socketService.emit.message({msg: 'Joined to room ' + room.title});
                this.chat.enableLocalChatHandling(this.room);
                this.room.sendInfoToAll();
                this.sendRoomList();
                return true;
            }
            return false;
        }

    }

    leaveRoom() {
        if(this.room) {
            var r_id = this.room.id;
            if(this.room.id === this.socket._id) { //if u are room's owner
                rooms_container = rooms_container.filter((room) => room.id !== this.room.id, this);
                this.socketService.toRoom().roomInfo(null);
                this.room.applyOnAll(this.chat.disableLocalChatHandling);
                this.room.leave(this);
                this.sendRoomList();
                return null;

            } else {
                var r = this.room;
                r.leave(this).sendInfoToAll();
                this.chat.disableLocalChatHandling();
                this.socketService.emit.roomInfo(null);
                this.sendRoomList();
                return r;

            }
        }
    }
}

module.exports.App = App;
module.exports.rooms_container = rooms_container;
