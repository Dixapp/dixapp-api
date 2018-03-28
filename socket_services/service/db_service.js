var getDbConnection = require('../../utils').getDbConnection;
var dbname = require('../../utils').dbname;

module.exports.loadCards = function() {
    return new Promise((resolve, reject)=>{
        getDbConnection().then((client)=>{
            var db = client.db(dbname);
            var questions = db.collection('cards').find({'cardType': 'Q', 'numAnswers': 2}).limit(100).toArray();
            var answers = db.collection('cards').find({'cardType': 'A'}).limit(400).toArray();
            Promise.all([questions, answers]).then((cards)=>{
                resolve(cards);
                client.close();
            });
        });
    });
};
