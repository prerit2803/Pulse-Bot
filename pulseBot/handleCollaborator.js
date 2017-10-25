var request = require('request')
var Promise = require('bluebird')
var redisDataStore = require("./redisDataStore.js");
var client = redisDataStore.client

var gitToken = "token " + process.env.githubToken
var orgName = "pulseBotProject"
var repoName = "MavenVoid"
var urlRoot = "https://github.ncsu.edu/api/v3"

//main function call to handle a user 

/*
handleUser(userName).then( (user)=>{
	//console.log('\n'+Date().toString()+":\t"+user)
	//return addUser(user)
}).catch((value)=>{
	console.log(value)
}).done()
*/

//addUser(userName)

//checks if user exists -> removes if necessary
function handleUser(user){
	return new Promise( (resolve,reject) => {
		checkUserExists(user).catch((value)=>{
		}).then((user)=> {
			client.get(user, (err, hasToBeRemoved)=>{
				if(hasToBeRemoved == 1){
					resolve(removeUser(user))
				}
				else {
					reject("No action taken for user "+user) }
			})
			
		})
	})
}

// check if user is a member of organization
function checkUserExists(user){
	var options = {
		url: urlRoot + "/repos/"+orgName+"/"+ repoName+"/collaborators/"+user,
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
			else reject("Couldn't find user!\n"+response.body)
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
			// console.log('\n'+Date().toString()+":\t"+JSON.stringify(response))
			if(response.statusCode===204){
				//console.log('\n'+Date().toString()+":\tremoved "+user)
				resolve(user)
			}
			else{
				reject("Couldn't remove user!\n"+response.body)
			} 
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
				//console.log('\n'+Date().toString()+":\tadded "+user)
				resolve(user)
			}
			else reject("Couldn't add user!\n"+JSON.stringify(response.body))
		})	
	})/*.catch( (value)=>{
		console.log(value)
	})*/
}


exports.handleUser= handleUser;
exports.addUser= addUser;
exports.removeUser= removeUser;
exports.checkUserExists= checkUserExists;
exports.orgName = orgName;
exports.repoName = repoName;
exports.urlRoot= urlRoot;
exports.client = client