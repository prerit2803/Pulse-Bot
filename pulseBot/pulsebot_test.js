// Slack token: xoxb-259933162213-cuEXH2HjVx5ZEkR5BKnSJB3i

var Botkit = require('botkit');

var redis = require('redis');
client = redis.createClient();



var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  token: 'xoxb-259933162213-cuEXH2HjVx5ZEkR5BKnSJB3i',
}).startRTM()


function checkIfUserExists(slackId){
    client.hexists('userMap', slackId , function(err, reply){
    // console.log("Reply is : " + reply);
    return reply;
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
  var reply = checkIfUserExists(message.user);//copy in all
  if(reply==0)
  	bot.reply(message,"Enter GitHubID followed by #");
  else{
  	client.hget('userMap', message.user, function(err, reply){
  		client.hget('noOfBrokenCommits', reply, function(err, resp){
  			bot.reply(message, "Number of Broken Commits: "+resp);
  		});
  	});
  }
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


controller.hears('master branch status',['mention', 'direct_mention','direct_message'], function(bot,message) 
{
  console.log(message);
  bot.reply(message,"Master branch is locked.");

});

controller.hears('stable branch name',['mention', 'direct_mention','direct_message'], function(bot,message) 
{
  console.log(message);
  bot.reply(message,"The stable branch name is Bahubali");

});

controller.hears('stable branch name',['mention', 'direct_mention','direct_message'], function(bot,message) 
{
  console.log(message);
  bot.reply(message,"The stable branch name is Bahubali");

});



