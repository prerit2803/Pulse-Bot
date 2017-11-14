	var request = require('request')
	var Promise = require('bluebird')
	
	var redisDataStore = require("./redisDataStore.js")
	var slackBot = require("./slackBot.js");
	var client= redisDataStore.client
	var myBot = slackBot.myBot
	var threshold = redisDataStore.MaxBrokenCommitThreshold

	var gitToken = "token " + process.env.githubToken
	var orgName = "pulseBotProject"
	var repoName = "MavenVoid"
	var urlRoot = "https://github.ncsu.edu/api/v3"
	

	//main function call to handle a user 	
	

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
				if(!err && value>=threshold-1){
					var notification= {
						text: 'You have made '+value+' broken commits today.',
						channel: channel
					}
					myBot.say(notification)
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
							myBot.say(notification, (err,response)=>{
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