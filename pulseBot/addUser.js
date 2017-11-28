var request = require('request')
var Promise = require('bluebird')

var gitToken = "token " + process.env.githubToken
var orgName = "pulseBotProject"
var repoName = "MavenVoid"
var urlRoot = "https://github.ncsu.edu/api/v3"
	

function addGithubUser(user){
	return new Promise( (resolve,reject)=>{
		checkUserExists(user)
		.then( (gitID)=>{
			if(gitID==1) reject("User already exists")
			else resolve(addUser(gitID))
		})
	})
}

//check if user exists
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
					resolve(1)
				}
				else resolve(user)
			})	
		})
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
				console.log("added user " + user)
				resolve(user)
			}
			else reject("Couldn't add user!\n"+JSON.stringify(response.body))
		})	
	})
}

exports.addGithubUser=addGithubUser;
