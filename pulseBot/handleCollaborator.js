	var Botkit = require('botkit');                              
	var request = require('request')
	var Promise = require('bluebird')
	var redisDataStore = require("./redisDataStore.js");
	var client = redisDataStore.client;
	//var bot = require("./slackBot.js");
	var gitToken = "token " + process.env.githubToken
	var orgName = "pulseBotProject"
	var repoName = "MavenVoid"
	var urlRoot = "https://github.ncsu.edu/api/v3"

	//main function call to handle a user 
	var controller = Botkit.slackbot({
	  debug: false
	  //include "log: false" to disable logging
	  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
	});

	// connect the bot to a stream of messages
	var bot = controller.spawn({
	 token: process.env.SLACKTOKEN,
	}).startRTM()
	
	handleUser('jrane1')
		//console.log('\n'+Date().toString()+":\t"+user)
		//return addUser(user)
	.catch((value)=>{
		console.log('catch '+value)
	}).done()
	
	//addUser(userName)
	//client.set('jrane',1)
	//checks if user exists -> removes if necessary
	function handleUser(gitID){
		return checkUserExists(gitID)
		.then(sendWarning)
		.then(sendNotification)
		.then(removeUser)
	}

	// check if user is a member of organizationcd 
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
		})/*.catch( (value)=>{
			console.log(value)
		})*/
	}
	
	client.hmset("noOfBrokenCommitsToday",'jrane',4)
	client.hmset("userMap",'U7M87B657','jrane')
	
	// send a slack notification if userBuggyCommitCount is more than 4
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
				else reject("Less than 4 count!")
			})
			resolve(user)
		})
	}

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