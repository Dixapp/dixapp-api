var App = require('./socket_app').App;
var loadCards = require('./service/db_service').loadCards;

var questions = null;
var answers = null;

class CAHApp extends App {
    initialize() {
        super.initialize();
    }

    enableGameInitialization() {
        this.room.owner.socketService.listen.startingGame((data)=> {
            this.hitStage(1)
        });
    }

    async prepareDeck() {
        var cards = await loadCards();
        this.room.answers = cards[1];
        this.room.questions = cards[0];
    }

    shuffleCards(cards) {
        var i = cards.length, temp, index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = cards[index];
            cards[index] = cards[i];
            cards[i] = temp;
        }
    }

    switchChooserPlayer() {
        if(!this.room.chooser) this.room.chooser = this.room.users[0];
        else this.room.chooser = this.room.users[(this.room.users.indexOf(this.room.chooser) + 1) % this.room.users.length];
        this.socketService.toRoom().chooser(this.room.chooser.nickname);
    }

    waitForChooserChoice() {
        this.room.chooser.socketService.listen.chooserChoice((winner)=> {
            var u = this.room.users.find((user)=> user.nickname === winner);
            this.room.winner = u;
            this.hitStage(4);
        });
    }



    hitStageTimeout(number, timeout) {
        var self = this;
        setTimeout(()=> self.hitStage(number),timeout);
    }

    hitStage(number) {
        if(this.room){
            this.room.stage = number;
            this.socketService.toRoom().stage(number);
            switch(number){
                case 0: //prepare
                    this.room.applyOnAll(this.clearEvents);
                    this.prepareDeck();
                    this.resetScorePoints();
                    this.enableGameInitialization();
                    break;
                case 1:

                    if(!this.ableToPlay()){
                        this.hitStage(0);
                        return;
                    }

                    this.room.applyOnAll(this.removeChosenCards);
                    this.room.applyOnAll(this.clearEvents);
                    this.room.applyOnAll(this.drawCards);
                    this.switchChooserPlayer();
                    this.hitStageTimeout(2, 1000);
                    break;
                case 2: //question and waiting for answers

                    if(!this.ableToPlay()){
                        this.hitStage(0);
                        return;
                    }

                    this.sendQuestion();
                    this.room.applyOnAll(this.hearAnswers, [this.room.chooser]);
                    break;
                case 3: //making decision

                    if(!this.ableToPlay()){
                        this.hitStage(0);
                        return;
                    }

                    this.sendChosenCards();
                    this.waitForChooserChoice();
                    break;
                case 4: //celebration

                    if(!this.ableToPlay()){
                        this.hitStage(0);
                        return;
                    }

                    this.respectTheWinner();
                    this.sendScorePoints();
                    this.hitStageTimeout(1, 1000);
                    break;
            }
        }
    }

    joinToRoom(room_id) {
        if(super.joinToRoom(room_id)) this.sendStage();
        if(this.room.chooser) this.socketService.emit.chooser(this.room.chooser.nickname);
        // if(this.room.chooser) this.socket.emit("chooser", this.room.chooser.nickname);
        var stage = this.room.stage;
        this.score = 0;
        switch(stage){
            case 0:
                break;
            case 1:
                if(!this.hand) this.drawCards();
                break;
            case 2:
                this.drawCards();
                this.hearAnswers();
                if(this.room.question) this.socketService.emit.question(this.room.question);
                break;
            case 3:
                this.sendChosenCards();
                this.sendQuestion();
                break;
            case 4:
                break;
        }
    }

    leaveRoom() {
        var room = super.leaveRoom();
        this.clearEvents();
        if(room){
            var stage = room.stage;
            var owner = room.owner;
            var was_chooser = room.chooser === this;
            if(!owner.ableToPlay()){
                owner.hitStage(0);
                return;
            }
            if(room.chooser === this){
                owner.switchChooserPlayer();
            }

            switch(stage) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    owner.checkIfEveryoneVoted();
                    break;
                case 3:
                    if(was_chooser) owner.hitStage(1);
                    else owner.sendChosenCards();
                    break;
                case 4:
                    break;
            }
        }

    }



    sendScorePoints() {
        var scores = {};
        for(var i=0; i < this.room.users.length; i++){
            var user = this.room.users[i];
            scores[user.nickname] = user.score;
        }
        this.socketService.toRoom().scores(scores);
    }

    removeChosenCards() {
        if(this.answers){
            this.hand = this.hand.filter((card)=> this.answers.indexOf(card.id) < 0, this);
            this.socketService.emit.cardsInHand(this.hand);
        }
    }

    createRoom(room_data) {
        if(super.createRoom(room_data)) this.hitStage(0);
    }

    sendChosenCards() {
        var answers = this.room.users.map((user)=> {
            if(!user.answers){
                return null;
            } else {
                var cards = user.answers.map((answer)=> user.hand.find((card)=> card.id === answer));
                var owner = user.nickname;
                return {
                    cards: cards,
                    owner: owner
                }
            }
        }).filter((answer)=> answer);
        console.log(answers);


        this.socketService.toRoom().answers(answers);
    }



    hearAnswers() {
        var self = this;
        this.socketService.listen.chosenFromHandCards((answers)=>{
            var user = self.room.users.find((user)=> user.socket._id == self.socket._id);
            user.answers = answers;
            var check = self.room.users.find((user) => !user.answers && this.room.chooser !== user, this);
            if(!check) self.hitStage(3);
        });
    }


    ableToPlay(){
        return this.room && this.room.users && this.room.users.length >= 2;
    }

    respectTheWinner() {
        this.room.winner.score++;
    }

    checkIfEveryoneVoted() {
        var check = this.room.users.find((user) => !user.answers && this.room.chooser !== user, this);
        if(!check) this.hitStage(3);
    }

    sendStage() {
        this.socketService.emit.stage(this.room.stage);
    }

    sendQuestion() {
        var question = this.room.questions.pop();
        this.room.question = question;
        this.socketService.toRoom().question(question);
    }

    drawCards() {
        if(!this.hand) this.hand = [];
        var cardsToDraw = this.room.answers.splice(0, 10 - this.hand.length);
        this.hand = [...this.hand, ...cardsToDraw];
        this.socketService.emit.cardsInHand(this.hand);
    }

    resetScorePoints() {
        this.room.users.map((user)=> user.score = 0);
    }

    stopHearingAnswers() {
        this.socketService.listen.stopChosenFromHandCards();
    }
    stopWaitingForChoice() {
        this.socketService.listen.stopChooserChoice();
    }
    disableGameInitialization() {
        this.socketService.listen.stopStartingGame();
    }

    clearEvents() {
        this.stopHearingAnswers();
        this.stopWaitingForChoice();
        this.disableGameInitialization();
        delete this.answers;
    }
}





module.exports.CAHApp = CAHApp;
