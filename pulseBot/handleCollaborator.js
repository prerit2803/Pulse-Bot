	var Botkit = require('botkit');                              
	var request = require('request')
	var Promise = require('bluebird')
	
	var client = require("./redisDataStore.js").client;
	var bot = require("./slackBot.js").myBot;
	
	var gitToken = "token " + process.env.githubToken
	var orgName = "pulseBotProject"
	var repoName = "MavenVoid"
	var urlRoot = "https://github.ncsu.edu/api/v3"

	//main function call to handle a user 	
	client.hmset("noOfBrokenCommitsToday",'jrane',3)
	client.hmset("userMap",'U7M87B657','jrane')

	//checks if user exists -> send notifications-> removes if necessary
	function handleUser(gitID){
		return new Promise( (resolve,reject)=>{
			checkUserExists(gitID)
			.then(sendWarning)
			.then(sendNotification)
			.then( (user)=>{
				client.exists(user, (err, hasToBeRemoved)=>{
					if(hasToBeRemoved == 1){
						resolve(removeUser(user))
					}
				})
			}).catch(console.log)
		})
	}

	// checks if user is a member of organizationcd 
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
				else reject("User doesn't exist!\n"+response.body)
			})	
		})
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
		})
	}

	// adds user to repo as collaborator
	function addUser(user){
		console.log("called")
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
					console.log("added user" + user)
					resolve(user)
				}
				else reject("Couldn't add user!\n"+JSON.stringify(response.body))
			})	
		})
	}
	
	// sends a private slack notification if BuggyCount is more than 4
	function sendWarning(user){
		return new Promise( (resolve,reject)=>{
			var channel
			client.hgetall('userMap', (err,obj)=>{
				if(!err && obj != undefined)
					channel=Object.keys(obj).find(key=> obj[key] === user)
				else reject("SlackID not found")
			})
			client.hget("noOfBrokenCommitsToday",user, (err, value)=>{
				if(!err && value>=4){
					var notification= {
						text: 'You have made '+value+' broken commits today.',
						channel: channel
					}
					bot.say(notification)
				}	
			})
			resolve(user)
		})
	}

	//sends a private notification if user is removed
	function sendNotification(user){
		return new Promise( (resolve,reject)=>{
			client.exists(user, (err, hasToBeRemoved)=>{
				if(hasToBeRemoved == 1){
					var channel
					client.hgetall('userMap', (err,obj)=>{
						if(!err && obj != undefined){
							channel=Object.keys(obj).find(key=> obj[key] === user)
							var notification= {
								text: 'You have been temporarily removed as collaborator of '+ repoName,
								channel: channel
							}
							bot.say(notification, (err,response)=>{
								resolve(user)	
							})
							
						}
						else reject("slackID not found")
					})
				}
				else reject('No action taken for user '+user)
			})
		})
	}

	exports.handleUser= handleUser;
	exports.addUser= addUser;
	exports.removeUser= removeUser;
	exports.checkUserExists= checkUserExists;
	exports.orgName = orgName;
	exports.repoName = repoName;
	exports.urlRoot= urlRoot;
	exports.client = client