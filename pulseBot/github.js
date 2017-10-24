var request = require('request');
var Promise = require('bluebird');
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})

var token = "token " + process.env.githubToken;
var orgName = "pulseBotProject";
var repoName = "MavenVoid";

var urlRoot = "https://github.ncsu.edu/api/v3";
// var commitID = "7e2af98abd9aed2b18831c5937b38f106aab20e9"
// var AuthorName = "jrane"
// var myJSON = {"commitID":commitID, "AuthorName": AuthorName, "source": "file"}

var protectionJson = {
  "required_status_checks": null,
  "required_pull_request_reviews": null,
  "enforce_admins": true,
  "restrictions":{
  "users": [],
  "teams": []
  }
}

function refactorOnStableBuild(jenkinsJSON){

  //updateStableCommitID Redis KEY->removeBranchProtection->deleteBranch->update stableBranchName Redis Key

  return new Promise(function(resolve, reject){
    var commitID = jenkinsJSON.commitID
    var userName = jenkinsJSON.AuthorName
    var source = jenkinsJSON.source
    var lastStableCommitKey = "lastStableCommit"
    var stableBranchNameKey = "stableBranchName"
    if(source != "jenkins"){
      lastStableCommitKey = "lastStableCommitTest"
      stableBranchNameKey = "stableBranchNameTest"
    }

    updateStableCommitID(lastStableCommitKey, commitID).then(function(commitID){
      return getStableBranchName(stableBranchNameKey)
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
      return updateStableBranchName(stableBranchNameKey, "master")
    }).then(function(branchName){
      resolve("refactorOnStableBuild successful ")
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
    var source = jenkinsJSON.source
    var lastStableCommitKey = "lastStableCommit"
    var stableBranchNameKey = "stableBranchName"
    var newBranchName = "stableBranch" + Date.now()
    if(source != "jenkins"){
      lastStableCommitKey = "lastStableCommitTest"
      stableBranchNameKey = "stableBranchNameTest"
      newBranchName = "testStableBranch" + Date.now()
    }

    getStableBranchName(stableBranchNameKey).then(function(stableBranchName){
      if(stableBranchName != "master"){
        return Promise.reject("Stable branch already exists ")
      }
      else{
        return getStableCommitID(lastStableCommitKey);
      }
    }).then(function(stableCommitID){
      return createBranch(orgName, repoName, newBranchName, stableCommitID)
    }).then(function(stableBranchName){
      return addBranchProtection(orgName, repoName, stableBranchName)
    }).then(function(stableBranchName){
      return updateStableBranchName(stableBranchNameKey, stableBranchName)
    }).then(function(branchName){
      resolve("refactorOnUnstableBuild successful")
    }).catch(function(error){
      reject(error)
    })
  })
}

function createBranch(orgName, repoName, branchName, commitID)
{
  console.log(urlRoot + "/repos/" + orgName + "/" + repoName + "/git/refs")
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
        console.log(response.statusCode)
        if(response.statusCode != 201){
          reject("error in createBranch: " + JSON.stringify(response.body))
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
        if(response.statusCode != 204){
          console.log("heteeeeeeeeeeeeeeeeeeeeeeeeeeee" + JSON.stringify(body))
          reject("error in deleteBranch: " + response.body)
        }
        resolve(branchName)
    });
  })
}

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
          reject("error in addBranchProtection: " + JSON.stringify(response.body))
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
          reject("error in removeBranchProtection: " + response.body)
        }
        resolve(branchName)
    });
  })
}

function updateStableCommitID(key, commitID){
  return new Promise(function(resolve, reject){
    client.set(key, commitID)
    client.get(key, function(err,value){
      if(commitID != value){
        reject(value)
      }
      resolve(commitID)
    })
  })
}

function getStableCommitID(key){
  return new Promise(function(resolve, reject){
    client.get(key, function(err,value){
      if(err){
        reject(value)
      }
      resolve(value)
    })
  })
}

function updateStableBranchName(key, branchName){
  return new Promise(function(resolve, reject){
    client.set(key, branchName)
    client.get(key, function(err,value){
      resolve(value)
    })
  })
}

function getStableBranchName(key){
  return new Promise(function(resolve, reject){
    client.get(key, function(err,value){
      resolve(value)
    })
  })
}

exports.refactorOnUnstableBuild = refactorOnUnstableBuild
exports.refactorOnStableBuild = refactorOnStableBuild
exports.updateStableBranchName = updateStableBranchName
exports.addBranchProtection = addBranchProtection
exports.removeBranchProtection = removeBranchProtection
exports.createBranch = createBranch
exports.deleteBranch = deleteBranch
exports.urlRoot = urlRoot
exports.orgName = orgName
exports.repoName = repoName