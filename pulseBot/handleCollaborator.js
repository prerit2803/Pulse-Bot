var request = require('request')
var Promise = require('bluebird')
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})

var gitToken = "token " + process.env.githubToken
var orgName = "pulseBotProject"
var repoName = "MavenVoid"
var userName= "mbehroo"
var urlRoot = "https://github.ncsu.edu/api/v3"


//main function call to handle a user 
handleUser(userName).then( (user)=>{
	//console.log('\n'+Date().toString()+":\t"+user)
	//return addUser(user)
}).catch((value)=>{
	console.log(value)
}).done()

//addUser(userName)

//checks if user exists -> removes if necessary
function handleUser(user){
	return new Promise( (resolve,reject) => {
		checkUserExists(user).then((user)=> {
			var hasToBeRemoved = 1//client.exists(user)
			if(hasToBeRemoved == 1){
				resolve(removeUser(user))
			}
			else reject('\n'+Date().toString()+":\tNo action taken for user "+user) 
		}).catch((value)=>{
			console.log(value)
		})
	})
}

// check if user is a member of organization
function checkUserExists(user){
	var options = {
		url: urlRoot + "/repos/"+orgName+"/"+ repoName+"/collaborators/"+userName,
	    method: 'GET',
	    headers: {
	      "content-type": "application/json",
	      "Authorization": gitToken,
	      "Accept":"application/vnd.github.hellcat-preview+json",
	    }
	}
	return new Promise( (resolve,reject)=>{
		request(options,(error,response,body)=>{		
			//console.log('\n'+Date().toString()+":\t"+JSON.stringify(response))
			if(response.statusCode===204){
				resolve(user)
			}
			else reject('\n'+Date().toString()+":\tCouldn't find user!\n"+JSON.stringify(response))
		})	
	})/*.catch((value)=>{
		console.log(value)
	})*/
}


// removes user from list of collaborators
function removeUser(user){
	var options = {
		url: urlRoot + "/repos/"+orgName+"/"+repoName+"/collaborators/"+user,
	    method: 'DELETE',
	    headers: {
	      "content-type": "application/json",
	      "Authorization": gitToken,
	      "Accept":"application/vnd.github.hellcat-preview+json",
	    }
	}
	return new Promise( (resolve, reject)=>{
		request(options,(error,response,body)=>{
			//console.log('\n'+Date().toString()+":\t"+JSON.stringify(response))
			if(response.statusCode===204){
				console.log('\n'+Date().toString()+":\tremoved "+user)
				resolve(user)
			}
			else reject('\n'+Date().toString()+":\t"+"Couldn't remove user!\n"+JSON.stringify(response))
		})
	})/*.catch( (value)=>{
		console.log(value)
	})*/
}


// adds user to repo as collaborator
function addUser(user){
	var options = {
		url: urlRoot + "/repos/"+orgName+"/"+repoName+"/collaborators/"+user,
	    method: 'PUT',
	    headers: {
	      "content-type": "application/json",
	      "Authorization": gitToken,
	      "Accept":"application/vnd.github.hellcat-preview+json"
	    },
	    json: {
	    	"permission": "push"
	    }
	}
	return new Promise( (resolve,reject)=>{
		request(options,(error,response,body)=>{
			//console.log('\n'+Date().toString()+":\t"+JSON.stringify(response))
			if(response.statusCode===204){
				console.log('\n'+Date().toString()+":\tadded "+user)
				resolve(user)
			}
			else reject('\n'+Date().toString()+":\tCouldn't add user!\n"+JSON.stringify(response))
		})	
	})/*.catch( (value)=>{
		console.log(value)
	})*/
}


exports.handleUser= handleUser;
exports.orgName = orgName;
exports.repoName = repoName;
exports.userName= userName;