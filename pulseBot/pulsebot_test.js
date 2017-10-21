var Botkit = require('botkit');
var Promise = require('promise');
var redis = require('redis');
client = redis.createClient();



var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  token: process.env.SLACKTOKEN,
}).startRTM()


function checkIfUserExists(slackId){
  return new Promise(function(resolve, reject){
    client.hexists('userMap', slackId , function(err, reply){
      console.log("Reply is : " + reply);
      resolve(reply);
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
function NoofBrokenCommitsToday(authorName){
  return new Promise(function(resolve,reject){
    client.exists(authorName,function(err, reply){
      if(reply ==0){
        console.log("Not blocked user");
        client.hget('noOfBrokenCommits', authorName, function(err, reply){
          resolve('{"NoofBrokenCommitsToday ":"'+5 -(+reply)+'"}');
        });
      }
      else{
            resolve('{"Blocked ":"'+5+'"}');
      }
    });
  });
}

function adduser(slackId,githubId){
    // console.log("slack id    "+ slackid);
    client.hmset('userMap', slackId, githubId, function(err,reply){
      console.log('{"GithubID ":"'+githubId+'"}');
    });
  }


controller.hears('bad commits left',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  console.log(message);
  checkIfUserExists(message.user).then(function(reply){
    console.log("rep: "+reply);
    if(reply==0)
    	bot.reply(message,"Enter GitHubID followed by #");
    else{
    	client.hget('userMap', message.user, function(err, reply){
    		client.hget('noOfBrokenCommits', reply, function(err, resp){
          if(resp==null)
            bot.reply(message, "Number of Broken Commits: "+0);
    			else {
    			 bot.reply(message, "Number of Broken Commits: "+resp);
    			}
    		});
    	});
    }
  });
});


  controller.hears('#',['mention', 'direct_mention','direct_message'], function(bot,message)
	{
	  console.log(message);
	  var input = message.text;
	  var gitID = input.split('#');
	  var githubID = gitID[1];
	  bot.reply(message,"Github ID: " + githubID);
	  adduser(message.user, githubID);
	});


// controller.hears('master branch status',['mention', 'direct_mention','direct_message'], function(bot,message)
// {
//   console.log(message);
//   client.hget('stableBranchName', reply, function(err, resp){
//     if(resp=="master")
//       bot.reply(message,"Master branch is stable.");
//     else {
//       bot.reply(message,"Master branch is locked.");
//     }
//   });
// });

controller.hears('stable branch name',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  console.log(message);
  client.get('stableBranchName', function(err, resp){
    if(resp=="master")
      bot.reply(message,"Master branch is stable. No build Failure");
    else {
      bot.reply(message,"Master branch is locked. "+resp+" is the new stable branch.");
    }
  });
});

controller.hears('grant me access',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  console.log(message);
  checkIfUserExists(message.user).then(function(reply){
    console.log("rep: "+reply);
    if(reply==0)
      bot.reply(message,"Enter GitHubID followed by #");
    else{
      client.hget('userMap', message.user, function(err, reply){
      CheckBlockedUser(reply).then(function(checkblocked){
        if(checkblocked==0){
          bot.reply(message, "You already have access to the repo");
        }
        else{
          console.log("User is "+reply);
          client.get(reply,function(err, timetoaccess){
            console.log("time "+timetoaccess);
            var t = new Date(null); // Epoch
            t.setTime(+timetoaccess*1000);
            bot.reply(message, "You can request next access after: " + t);
          });
        }
      });

      });
    }
  });
});

controller.hears('repo health',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  console.log(message);
  checkIfUserExists(message.user).then(function(reply){
    console.log("rep: "+reply);
    if(reply==0)
      bot.reply(message,"Enter GitHubID followed by #");
    else{
      var result = "";
      client.hget('userMap', message.user, function(err, reply){
        NoofBrokenCommitsToday(reply).then(function(resp){
          result += "Your bad commits for the day: "+resp;
          client.get('stableBranchName', function(err, res){
            result += " Stable Branch is "+res;
            bot.reply(message, result);
          });
        });
      });
    }
  });
});




