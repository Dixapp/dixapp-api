/**
//  * Created by MD on 17/10/17.
//  */

var utils=require('../../../utils');
var bcrypt = require('bcryptjs');
var userService = require('../../../services/user_service');


module.exports = function(r){
	r.post('/', (req,res)=>{
		var newUser={
			email:req.body.email,
			password:req.body.password
		};
		userService.createUser(newUser).then(()=> res.json({status: 'ok'})).catch((err)=> {
		    res.status(400);
            res.json({error: err, status: 'bad'});
		});
	});
};
