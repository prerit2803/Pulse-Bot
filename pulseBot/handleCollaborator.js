var request = require('request')
var fs = require("fs")
var Promise = require('bluebird')
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})

var gitToken = "token " + process.env.githubToken
var orgName = "pulseBotProjec"
var repoName = "MavenVoid"
var userName= "jrane"
var urlRoot = "https://github.ncsu.edu/api/v3"
var maxCount = 5

handleUser(userName).then((user)=>{
	addUser(user)
}).catch((value)=>{
	console.log(value)
})

function handleUser(user){
	return new Promise( (resolve,reject) => {
		checkUserExists(user).then((user)=> {
			var userCount = 6//client.get(user)
			console.log(userCount)
			if(userCount>maxCount){
				resolve(removeUser(user))
			}
			else reject("handleUser\n"+user) 
		}).catch((value)=>{
			console.log(value)
		})
	})
}

function checkUserExists(user){
	var options = {
		url: urlRoot + "/orgs/"+orgName+"/members/"+user,
	    method: 'GET',
	    headers: {
	      "content-type": "application/json",
	      "Authorization": gitToken,
	      "Accept":"application/vnd.github.hellcat-preview+json",
	    }
	}
	return new Promise( (resolve,reject)=>{
		request(options,(error,response,body)=>{		
			if(response.statusCode===204){
				resolve(user)
			}
			else reject("checkUserExists"+body)
		})	
	}).catch((value)=>{
		console.log(value)
	})
}

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
			console.log("remove user response:"+response.statusCode)
			if(response.statusCode===204){
				console.log("removed "+user)
				resolve(user)
			}
			else reject("removeUser"+body)
		})
	}).catch( (value)=>{
		console.log(value)
	})
}

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
			console.log("add user response:"+response.statusCode)
			if(response.statusCode===204){
				console.log("added "+user)
				resolve(user)
			}
			else reject("addUser"+body)
		})	
	}).catch( (value)=>{
		console.log(value)
	})
}
