var request = require('request');
var fs = require("fs");
var Promise = require('bluebird');
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})

var token = "token " + process.env.githubToken;
var userId = "pulseBotProject";
var repoName = "MavenVoid";
// var branchName = "stableBranch"// + Date.now()
var sha = "7e2af98abd9aed2b18831c5937b38f106aab20e9"
var lastStableCommitKey = "lastStableCommit"
var stableBranchNameKey = "stableBranchName"

var myJSON = {"commitID":sha, "AuthorName": "sshah11"}

var protectionJson = {
  "required_status_checks": null,
  "required_pull_request_reviews": null,
  "enforce_admins": true,
  "restrictions": null
}

var urlRoot = "https://github.ncsu.edu/api/v3";


// var myPromise = createBranch(userId, repoName, branchName).then(function(response){
//   console.log("successful " + JSON.stringify(response))
// }).catch(function(response){
//   console.log("error " + JSON.stringify(response));
// })

// var myPromise2 = updateStableCommitKey(sha).then(console.log)

refactorOnStableBuild(myJSON).then(function(data){
  console.log(data)
})

function refactorOnStableBuild(jenkinsJSON){
  return new Promise(function(resolve, reject){
    var sha = jenkinsJSON.commitID
    var userName = jenkinsJSON.AuthorName

    updateStableCommit(sha).then(function(sha){
      return getStableBranchname()
    }).then(function(stableBranchName){
      if(stableBranchName == "master"){
        return;
      }
      return removeBranchProtection(userName, repoName, stableBranchName)
    }).then(function(stableBranchName){
      return deleteBranch(userName, repoName, stableBranchName)
    }).then(function(branchName){
      return updateStableBranchName("master")
    })
  })
}

function refactorOnUnstableBuild(jenkinsJSON){
  return new Promise(function(resolve, reject){
    var sha = jenkinsJSON.commitID
    var userName = jenkinsJSON.AuthorName
    console.log("here1")
    createBranch(userName, repoName, "stableBranch" + Date.now()).then(function(stableBranchName){
      console.log("here")
      return addBranchProtection(userName, repoName, stableBranchName)
    }).then(function(stableBranchName){
      console.log("here2")
      return updateStableBranchName(stableBranchName)
    })
  })
}

function getBranchProtection(userName, repoName, branchName){
   var options = {
    url: urlRoot + "/repos/" + userName + "/" + repoName + "/branches/" + branchName + "/protection",
    method: 'GET',
    headers: {
      "content-type": "application/json",
      "Authorization": token,
      "Accept": "application/vnd.github.loki-preview"
    }
  };

  return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        // console.log(response.statusCode)
        resolve(branchName)
    });
  })
}

function addBranchProtection(userName, repoName, branchName){
   var options = {
    url: urlRoot + "/repos/" + userName + "/" + repoName + "/branches/" + branchName + "/protection",
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
        // console.log(response.statusCode)
        resolve(branchName)
    });
  })
}

function removeBranchProtection(userName, repoName, branchName){
   var options = {
    url: urlRoot + "/repos/" + userName + "/" + repoName + "/branches/" + branchName + "/protection",
    method: 'DELETE',
    headers: {
      "content-type": "application/json",
      "Authorization": token,
      "Accept": "application/vnd.github.loki-preview"
    },
  };

  return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        // console.log(response.statusCode)
        resolve(branchName)
    });
  })
}

function updateStableCommit(sha){
  return new Promise(function(resolve, reject){
    client.set(lastStableCommitKey, sha)
    client.get(lastStableCommitKey, function(err,value){
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

function createBranch(userName, repoName, branchName)
{
  var options = {
    url: urlRoot + "/repos/" + userName + "/" + repoName + "/git/refs",
    method: 'POST',
    headers: {
      "User-Agent": "EnableIssues",
      "content-type": "application/json",
      "Authorization": token
    },
    json: {
      "ref": "refs/heads/" + branchName,
      "sha": sha
    }
  };

  return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        console.log(response.body)
        if(response.statusCode != 201){
          reject(response.body)
        }
        resolve(branchName)
    });
  })
}

function deleteBranch(userName, repoName, branchName)
{
  var options = {
    url: urlRoot + "/repos/" + userName + "/" + repoName + "/git/refs/heads/" + branchName,
    method: 'DELETE',
    headers: {
      "User-Agent": "EnableIssues",
      "content-type": "application/json",
      "Authorization": token
    }
  };
 
  return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if(response.statusCode != 204){
          reject(response.body)
        }
        resolve(branchName)
    });
  })
}