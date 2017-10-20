var redis = require("redis");
var Promise = require('promise');
client = redis.createClient();

var MaxBrokenCommitThreshold = 5;

var fake = {
  "commitID":"get",
  "AuthorName":"qwret"
}

var myPromise = BuildSucceded(fake).then(function(response){
  console.log("successful " + JSON.stringify(response));
}).catch(function(response){
  console.log("error " + JSON.stringify(response));
});

function BuildSucceded(userDetails){
  return new Promise(function(resolve, reject){
    var commitID = userDetails.commitID;
    var authorName = userDetails.AuthorName;
    addCommitId(commitID,authorName).then(function(addcommitid){
      return addStatus(commitID,"success");
    }).then(function(status){
      return totalNoOfCommits(authorName);
    }).then(function(response){
      resolve(response);
    });
  });
}

function BuildFailed(userDetails){
  return new Promise(function(resolve, reject){
    var commitID = userDetails.commitID;
    var authorName = userDetails.AuthorName;
    addCommitId(commitID,authorName).then(function(addcommitid){
      return addStatus(commitID,"fail");
    }).then(function(status){
      return totalNoOfCommits(authorName);
    }).then(function(commits){
      return CheckBlockedUser(authorName);
    }).then(function(reply){
      if(reply==0)
        return NoOfBrokenCommits(authorName);
      else {
        return new Promise(function(resolve, reject){
          client.get(authorName, function(err,reply){
            var t = new Date(null); // Epoch
            t.setTime(+reply*1000);
            resolve('{"Error":"User is Blocked, Next access at '+t+'"}');
          });
        });
      }
    }).then(function(response){
      resolve(response);
    });
  });
}

function checkIfUserExists(slackId,githubId){
  return new Promise(function(resolve,reject){
    client.hexists('userMap', slackId , function(err, reply){
    if(err){
      reject('{"Error":"'+err+'"}');
    }
    // console.log("Reply is : " + reply);
    if(reply===0){
      if(githubId){
        adduser(slackId,githubId);
        resolve('{"GithubID ":"'+githubId+'"}');
      }
      else{
        reject('{"Error":"Enter github Id !"}');
    }
    }
    else{
      client.hget('userMap', slackId, function(err,reply){
        if(err){
          reject('{"Error":"'+err+'"}');
        }
        else{
          resolve('{"GithubID ":"'+reply+'"}');
        }
      });
    }
  });
});
}

function adduser(slackId,githubId){
  return new Promise(function(resolve,reject){
    // console.log("slack id    "+ slackid);
    client.hmset('userMap', slackId, githubId, function(err,reply){
      resolve('{"GithubID ":"'+githubId+'"}');
    });
    });
  }

function addCommitId(commitID,authorName){
  return new Promise(function(resolve,reject){
    // console.log("in add commitid" + commitID      + authorName);
    client.hmset('commitIDAuthorNameMap', commitID, authorName, function(err,reply){
        resolve("Added commitID");
    });
  });
}

function addStatus(commitID, status){
  return new Promise(function(resolve,reject){
    // console.log("in addStatus" + commitID      + status);
      client.hmset('commitIDStatusMap', commitID, status,function(err,reply){
          resolve("Added status");
      });
    });
}

function CheckBlockedUser(authorName){
  return new Promise(function(resolve,reject){
  client.exists(authorName, function(err,reply){
    resolve(reply);
    });
  });
}

function NoOfBrokenCommits(authorName){
  var value = 1;
  return new Promise(function(resolve,reject){
    client.hexists('noOfBrokenCommits', authorName , function(err, reply){
      if(reply ==0){
        client.hmset('noOfBrokenCommits', authorName, value, function(err,reply){
            resolve(authorName);
        });
      }
      else{
         client.hget('noOfBrokenCommits', authorName ,function(err, reply){
             if(reply >= MaxBrokenCommitThreshold){
               var expirationTime = parseInt(((+new Date)/1000)+86400);
                client.set(authorName, expirationTime);
                client.expire(authorName, expirationTime);
                client.hmset('noOfBrokenCommits', authorName, 0, function(err,reply){
                  resolve(authorName);
                });
             }
             else {
               client.hmset('noOfBrokenCommits',authorName, +reply + 1, function(err,reply){
                    resolve(authorName);
               });
             }
         });
      }
    });
  });
}

function NoofBrokenCommitsToday(authorName){
  return new Promise(function(resolve,reject){
    client.exists(authorName,function(err, reply){
      if(reply ==0){
        console.log("Not blocked user");
        client.hget('noOfBrokenCommits', authorName, function(err, reply){
          resolve('{"NoofBrokenCommitsToday ":"'+MaxBrokenCommitThreshold -(+reply)+'"}');
        });
      }
      else{
            resolve('{"Blocked ":"'+MaxBrokenCommitThreshold+'"}');
      }
    });
  });
}

function totalNoOfCommits(authorName){
  var value = 1 ;
  // console.log("in totalNoOfCommits" +authorName);
  return new Promise(function(resolve,reject){
    client.hexists('totalNoOfCommits', authorName , function(err, reply){

      if(reply ==0){
        client.hmset('totalNoOfCommits', authorName, value, function(err,reply){
            resolve(authorName);
        });
      }
      else{
         client.hget('totalNoOfCommits', authorName ,function(err, reply){
          client.hmset('totalNoOfCommits',authorName, +reply + 1, function(err,reply){
               resolve(authorName);
          });
         });
      }
    });
  });
}
