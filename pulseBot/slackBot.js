var Botkit = require('botkit');
var Promise = require('promise');
var main = require("./redisDataStore.js");
client = main.client;



var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
 token: process.env.SLACKTOKEN,
}).startRTM()


// calltotalNoOfCommits();
// noOfBrokenCommits();
// userMap();


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
  console.log(authorName);
  return new Promise(function(resolve,reject){
    client.exists(authorName,function(err, reply){
      if(reply ==0){
        console.log("Not blocked user "+authorName);
        client.hget('noOfBrokenCommitsToday', authorName, function(err, rep){

                console.log("here "+rep);
          if(rep == null)
              resolve(0);
          resolve(rep);
        });
      }
      else{
            resolve("User is Blocked");
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


controller.hears('^(?!.*(#|Hi|stable branch name|Grant me repo access|repo health|bad commits left for the day))',['mention', 'direct_mention','direct_message'], function(bot,message)
{
	console.log(message);

	bot.reply(message,"I'm sorry but i only understand the following commands: \n 1. Stable branch name\n 2. Grant me repo access \n 3. repo health \n 4. bad commits left for the day");

});

controller.hears('Hi',['mention', 'direct_mention','direct_message'], function(bot,message)
{
	console.log(message);
	bot.reply(message,"Hello! How can i help you today ? You can ask me any of the following questions: \n 1. What is the stable branch name ?\n 2. Grant me repo access \n 3. What is the repo health ? \n 4. What are my bad commits left for the day ?");

});

controller.hears('bad commits left for the day',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  console.log(message);
  checkIfUserExists(message.user).then(function(reply){
    console.log("rep: "+reply);
    if(reply==0)
    	bot.reply(message,"Enter GitHubID starting with #");
    else{
    	client.hget('userMap', message.user, function(err, reply){
    		NoofBrokenCommitsToday(reply).then(function(resp){
    			 bot.reply(message, "Number of bad commits left: "+(5-(+resp)));
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
  // console.log(message);
  client.get('stableBranchNameTest', function(err, resp){
    if(resp=="master")
      bot.reply(message,"Master branch is stable. No build Failure");
    else {
      bot.reply(message,"Master branch is unstable. "+resp+" is the new stable branch.");
    }
  });
});

controller.hears('Grant me repo access',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  console.log(message);
  checkIfUserExists(message.user).then(function(reply){
    console.log("rep: "+reply);
    if(reply==0)
      bot.reply(message,"Enter GitHubID starting with # (dont add spaces)");
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
      bot.reply(message,"Enter GitHubID starting with # (no spaces)");

  	  // After entering Github ID, the user should still be able to see the repo health. User-Specific report will be
  	  // showing null values, while repo specific values can still be visible to the new user.

    else{
      var result = "";
      // Displays number of broken commits for user
      client.hget('userMap', message.user, function(err, reply){
      console.log("usermap is : " + reply);
        NoofBrokenCommitsToday(reply).then(function(resp){

          result += "Your bad commits for the day: "+resp;

      // Displays stable branch name
      client.get('stableBranchNameTest', function(err, res){

          result += " \n Stable Branch is "+ res;

          // bot.reply(message, result);



      // total number of commits, contributors and their commits
      // result="";
      client.hgetall('totalNoOfCommits',function(err,reply){

      		var totcommitscount = 0
      		var arr = reply;
    		var i = 0;
      		var repostats = "";
      		for (var key in arr) {
      			i+=1;
  			if (arr.hasOwnProperty(key)) {
   				var val = arr[key];
    			totcommitscount+= +val;
    			repostats+= (key+" "+val+"\n");
  					}
				}

			// result += "\n Number of contributors on repo: " +i+ " \n Total number of commits on this repo: " + totcommitscount +
			// "\n Names of repo contributors and their total commits: \n" + repostats;
			result+="\n Names of repo contributors and their total commits: \n" + repostats;

      		// bot.reply(message, result);

      // result="";

      // displays bad and good commits percentage
      client.hgetall('noOfBrokenCommits',function(err,reply){

      		var arr = reply;
      		var totbadcommitscount = 0;

      		for (var key in arr) {
  			if (arr.hasOwnProperty(key)) {
   				var val = arr[key];
    			totbadcommitscount+= +val;
  					}
				}

			badcommitspercentage = (totbadcommitscount/totcommitscount)*100;
			goodcommitspercentage = 100 - badcommitspercentage;

			// result += "\nBad commits percentage on repo: " + badcommitspercentage.toFixed(2) + "% \n Good commmits percentage on repo: " + goodcommitspercentage.toFixed(2)+"%";
      		bot.reply(message, result);


      		  });
      		});
          });
        });
      });
    }
  });
});


// function calltotalNoOfCommits()
// {
// 	client.hmset('totalNoOfCommits','prerit','3');
// 	client.hmset('totalNoOfCommits','ankur','3');
// 	client.hmset('totalNoOfCommits','shaishav','3');
// 	client.hmset('totalNoOfCommits','akriti','4');
// 	client.hmset('totalNoOfCommits','jaydeep','4');
// }

// function noOfBrokenCommits()
// {
// 	client.hmset('noOfBrokenCommits','jaydeep','1');
// 	client.hmset('noOfBrokenCommits','prerit','1');
// 	client.hmset('noOfBrokenCommits','shaishav','2');
// 	client.hmset('noOfBrokenCommits','ankur','2');
// 	client.hmset('noOfBrokenCommits','akriti','1');
// }

// function callcommitIDStatusMap()
// {
// 	client.hmset('commitIDStatusMap','123','1');
// 	client.hmset('commitIDStatusMap','1111','0');
// 	client.hmset('commitIDStatusMap','121','1');
// 	client.hmset('commitIDStatusMap','123','0');

// }

// function userMap()
// {
// 	client.hmset('userMap','jaydeep','jaydeep');
// }
