var utils=require('../../../utils');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

module.exports = function(r){
    r.get("/",function (req,res) {
        res.json({
            logged: true
        }); //if not, jwt should not allow to get here
    });

    r.get("/test",function (req,res) {



        res.sendFile('/home/ktoztam/dixapp/dixapp-api/test/image.png');
        // res.json({
        //     logged: true
        // }); //if not, jwt should not allow to get here
    });

};
