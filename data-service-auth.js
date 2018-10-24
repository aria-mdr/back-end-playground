const mongoose = require('mongoose');
const bcrpyt   = require('bcryptjs');

const Schema = mongoose.Schema;
let userSchema = new Schema(
    {
	"user": { type: String, unique:true },
	"password": String, 
	"email" : String,
	"logInHistory" : [{"dateTime" : Date, "userAgent" : String}]
    }
);
let User;
module.exports.initialize = () => {
    return new Promise( 
	(resolve,reject) => {
	    let db = mongoose.createConnection("mongodb://Amoradpour:241990M.a@ds231941.mlab.com:31941/web322");
	    db.on('error',(err)=>{ reject(err); } );
	    db.once('open', ()=>{ User = db.model("users",userSchema); resolve(); });
	}
    );
};
module.exports.registerUser = (userData) => {
	let newUser = new User(userData);
    return new Promise( (resolve,reject) =>{
		if(userData.password != userData.password2) 
			reject("Passwords do not match");
		else{
			bcrpyt.genSalt(10, (err, salt) =>
				{
					bcrpyt.hash(userData.password, salt, (err, hash) =>{
						newUser.password = hash;
						console.log("inside gensalt /n newUser.password : " + newUser.password + "\n hash : " + hash);
						newUser.save((err)=>{
							if(err) 
							{ 
								console.log("There was an error saving the user information: ", err); 
								if(err.code == 11000) 
									reject("User Name already taken");
								else 
									reject("There was an error creating the user: ", err);
							}
							else 
							{
								console.log(newUser); 
								resolve();
							}
					});
					});
				});
				console.log("outside gensalt /n newUser.password : " + newUser.password + "\n hash : ");


		}
	});
}
module.exports.getUser = (username) =>
{
	return new Promise((resolve, reject) => {
		User.find( 
			{user : username}
		).exec()
		.then((data) =>{
			if(data.length == 0 )
				reject("Unable to find user " + username);
			else
				resolve(data[0]);
		})
	})
}
module.exports.checkUser = (userData) =>{
    return new Promise(
	(resolve,reject) => {
	    User.find( { user: userData.user } )
		.exec()
		.then( 
			(data) => 
			{
				if(data.length == 0) 
					reject("Unable to find user: " + userData.user);
				bcrpyt.compare(userData.password, data[0].password)
				.then((res) =>
				{
					if(!res) 
						reject("Incorrect Password for user: " + userData.user);
					else
					{
						data[0].logInHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
						User.update({ password: data[0].password},
						{ $set: { logInHistory: data[0].logInHistory } },
						{ multi: false })
						.exec();
						resolve(data[0]);
					}
				});
		    } ).catch( (err) => { 
				console.log("Error: checkUser() reject: ",err); 
				reject("Unable to find user: " + userData.user);
			} );
	});
}