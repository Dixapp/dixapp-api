/**
 * Created by MD on 17/10/17.
 */
var userService = require('../../services/user_service');

module.exports = function(r){
r.post('/',function (req,res) {
        // console.log(req);
        // if(req.body.username=='admin' && req.body.password=='asd')
    var theUser={
        email:req.body.email,
        password:req.body.password
    };

    userService.authenticate(theUser).then((data)=>res.json(data)).catch((err)=> res.status(400).json({msg: err}));


    // utils.getDbConnection().then((client)=>{
    //
     //    var db = client.db(utils.dbname);
    //  	db.collection('users').findOne({
    //  		email:theUser.email
    //  	},(err,user)=>{
    //  		if(err){
    //  			console.log('Error getting users list:'+err);
    // 			res.sendStatus(500);
    // 			client.close();
    //  		}
    //  		else if(user){
    //
    //  			bcrypt.compare(theUser.password, user.hash, (err, auth) => {
    //  				if(err){
    // 		 			console.log('Error unhashing password:'+err);
    // 					res.sendStatus(500);
    // 					client.close();
    // 		 		}else if (auth){
    // 		 			res.json({
    // 	                  user: user.email,
    // 	                  token: utils.generateToken(user)
    // 	                });
    //
    // 		 		}else{
    // 		 			console.log('Bad password:' +theUser.password);
    // 		 			res.sendStatus(403);
    // 		 		}
    // 				client.close();
    //  			});
    //
    //
    //  		}else{
    //  			console.log('Bad user:' +theUser.email);
    //  			res.sendStatus(403);
    // 			client.close();
    //  		}
    //  	});
    //
    // }).catch((err)=>{
    // 	console.log(err);
    // 	res.sendStatus(500);
    // });
});
};
