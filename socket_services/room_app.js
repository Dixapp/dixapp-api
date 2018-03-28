
class RoomApp {

    constructor(owner, data) {

        for(var prop in data) {
            this[prop] = data[prop];
        }

        this.owner = owner;
        this.nsp = this.owner.nsp;
        this.namespace = this.owner.namespace;

        this.owner.room = this;

        this.users = [owner];
        this.id = owner.socket._id;

        this.owner.socket.join(this.id);
    }

    join(user) {
        this.users.push(user);
        user.room = this;
        user.socket.join(this.id);
    }

    getInfo() {
        return {
            title: this.title,
            users: this.users.map((user)=> user.nickname),
            id: this.id,
            owner: this.owner.nickname
        }
    }

    leave(user) {
        if(user === this.owner){
            for(var i=0; i < this.users.length; i++){
                this.users[i].socket.leave(this.id);
                delete this.users[i].room;
            }
        } else {
            this.users = this.users.filter((u) => u.socket._id !== user.socket._id);
            user.socket.leave(this.id);
            delete user.room;
        }
        return this;
    }

    sendInfoToAll() {
        this.nsp.to(this.id).emit("room_info", this.getInfo());
    }

    applyOnAll(callback, exceptions) {
        var except = exceptions ? exceptions : [];
        this.users.map((user) => {
            if(except.indexOf(user) < 0) callback.apply(user)
        });
    }


}

class RoomContainer {

    constructor() {
        this.rooms = [];
    }

    add(room) {
        this.rooms.push(room);
    }

    getRoomsInfo() {
        return this.rooms.map((room)=> room.getInfo());
    }



}

module.exports.RoomApp = RoomApp;
