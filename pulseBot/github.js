var request = require('request');
var Promise = require('bluebird');
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})

var token = "token " + process.env.githubToken;
var orgName = "pulseBotProject";
var repoName = "MavenVoid";

var lastStableCommitKey = "lastStableCommit"
var stableBranchNameKey = "stableBranchName"

// var commitID = "7e2af98abd9aed2b18831c5937b38f106aab20e9"
// var AuthorName = "jrane"
// var myJSON = {"commitID":commitID, "AuthorName": AuthorName}

var protectionJson = {
  "required_status_checks": null,
  "required_pull_request_reviews": null,
  "enforce_admins": true,
  "restrictions":{
  "users": [],
  "teams": []
  }
}

var urlRoot = "https://github.ncsu.edu/api/v3";

function refactorOnStableBuild(jenkinsJSON){

  //updateStableCommitID Redis KEY->removeBranchProtection->deleteBranch->update stableBranchName Redis Key

  return new Promise(function(resolve, reject){
    var commitID = jenkinsJSON.commitID
    var userName = jenkinsJSON.AuthorName

    updateStableCommitID(commitID).then(function(commitID){
      return getStableBranchname()
    }).then(function(stableBranchName){
      if(stableBranchName == "master"){
        return Promise.reject("master is already stable")
      }
      else{
        return removeBranchProtection(orgName, repoName, stableBranchName)
      }
    }).then(function(stableBranchName){
      return deleteBranch(orgName, repoName, stableBranchName)
    }).then(function(branchName){
      return updateStableBranchName("master")
    }).then(function(branchName){
      resolve("refactorOnStableBuild successful")
    }).catch(function(error){
      reject(error)
    })
  })
}

function refactorOnUnstableBuild(jenkinsJSON){

  //get lastStableCommitID from REDIS->createStableBranch->addBranchProtection->update stableBranchName Redis Key

  return new Promise(function(resolve, reject){
    var commitID = jenkinsJSON.commitID
    var userName = jenkinsJSON.AuthorName
    
    getStableBranchname().then(function(stableBranchName){
      if(stableBranchName != "master"){
        return Promise.reject("Stable branch already exists")
      }
      else{
        return getStableCommitID();
      }
    }).then(function(stableCommitID){
      return createBranch(orgName, repoName, "stableBranch" + Date.now(), stableCommitID)
    }).then(function(stableBranchName){
      return addBranchProtection(orgName, repoName, stableBranchName)
    }).then(function(stableBranchName){
      return updateStableBranchName(stableBranchName)
    }).then(function(branchName){
      resolve("refactorOnUnstableBuild successful")
    }).catch(function(error){
      reject(error)
    })
  })
}


// updateStableCommitID("063df6f74d63b8c4c9b7cfe71ed60024cae8bb67").then(function(commitID){
//   return refactorOnStableBuild(myJSON)
// }).then(function(data){
//   console.log(data)
// })


// function getBranchProtection(orgName, repoName, branchName){
//    var options = {
//     url: urlRoot + "/repos/" + orgName + "/" + repoName + "/branches/" + branchName + "/protection",
//     method: 'GET',
//     headers: {
//       "content-type": "application/json",
//       "Authorization": token,
//       "Accept": "application/vnd.github.loki-preview"
//     }
//   };

//   return new Promise(function (resolve, reject) {
//       request(options, function (error, response, body) {
//         // console.log(response.statusCode)
//         resolve(branchName)
//     });
//   })
// }

function addBranchProtection(orgName, repoName, branchName){
   var options = {
    url: urlRoot + "/repos/" + orgName + "/" + repoName + "/branches/" + branchName + "/protection",
    method: 'PUT',
    headers: {
      "content-type": "application/json",
      "Authorization": token,
      "Accept": "application/vnd.github.loki-preview"
    },
    json: protectionJson
  };
 
  return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if(response.statusCode!=200){
          reject("error in addBranchProtection: " + body)
        }
        resolve(branchName)
    });
  })
}

function removeBranchProtection(orgName, repoName, branchName){
   var options = {
    url: urlRoot + "/repos/" + orgName + "/" + repoName + "/branches/" + branchName + "/protection",
    method: 'DELETE',
    headers: {
      "content-type": "application/json",
      "Authorization": token,
      "Accept": "application/vnd.github.loki-preview"
    },
  };

  return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
      if(response.statusCode!=204){
        reject("error in removeBranchProtection: " + body)
      }
      resolve(branchName)
    });
  })
}

function updateStableCommitID(commitID){
  return new Promise(function(resolve, reject){
    client.set(lastStableCommitKey, commitID)
    client.get(lastStableCommitKey, function(err,value){
      if(commitID != value){
        reject(value)
      }
      resolve(commitID)
    })
  })
}

function getStableCommitID(){
  return new Promise(function(resolve, reject){
    client.get(lastStableCommitKey, function(err,value){
      if(err){
        reject(value)
      }
      resolve(value)
    })
  })
}

function updateStableBranchName(branchName){
  return new Promise(function(resolve, reject){
    client.set(stableBranchNameKey, branchName)
    client.get(stableBranchNameKey, function(err,value){
      resolve(value)
    })
  })
}

function getStableBranchname(){
  return new Promise(function(resolve, reject){
    client.get(stableBranchNameKey, function(err,value){
      resolve(value)
    })
  })
}

function createBranch(orgName, repoName, branchName, commitID)
{
  var options = {
    url: urlRoot + "/repos/" + orgName + "/" + repoName + "/git/refs",
    method: 'POST',
    headers: {
      "content-type": "application/json",
      "Authorization": token
    },
    json: {
      "ref": "refs/heads/" + branchName,
      "sha": commitID
    }
  };

  return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if(response.statusCode !== 201){
          reject("error in createBranch " + JSON.stringify(response.body))
        }
        resolve(branchName)
    });
  })
}

function deleteBranch(orgName, repoName, branchName)
{
  var options = {
    url: urlRoot + "/repos/" + orgName + "/" + repoName + "/git/refs/heads/" + branchName,
    method: 'DELETE',
    headers: {
      "content-type": "application/json",
      "Authorization": token
    }
  };
 
  return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if(response.statusCode !== 204){
          reject("error in deleteBranch: " + body)
        }
        resolve(branchName)
    });
  })
}

exports.refactorOnUnstableBuild = refactorOnUnstableBuild
exports.refactorOnStableBuild = refactorOnStableBuild
exports.updateStableBranchName = updateStableBranchName
