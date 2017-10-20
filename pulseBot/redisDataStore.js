var redis = require("redis");
var Promise = require('promise');
client = redis.createClient();

function checkIfUserExists(slackId,githubId){
  return new Promise(function(resolve,reject){
    client.hexists('userMap', slackId , function(err, reply){
    if(err){
      reject('{"Error":"'+err+'"}');
    }
    // console.log("Reply is : " + reply);
    if(reply===0){
      console.log("in if");
      if(githubId){
        adduser(slackId,githubId);
        resolve('{"GithubID ":"'+githubId+'"}');
      }
      else{
        reject('{"Error":"Enter github Id !"}');
    }
    }
    else{
      console.log("gitid " + client.hget('userMap', slackId, function(err,reply){
        if(err){
          reject('{"Error":"'+err+'"}');
        }
        else{
          resolve('{"GithubID ":"'+reply+'"}');
        }
      }));
    }
  });
});
}

function adduser(slackId,githubId){
  return new Promise(function(resolve,reject){
    // console.log("slack id    "+ slackid);
    client.hmset('userMap', slackId, githubId);
      resolve('{"GithubID ":"'+githubId+'"}');
    });
  }
