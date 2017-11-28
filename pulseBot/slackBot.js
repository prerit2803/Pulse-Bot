var Botkit = require('botkit');
var Promise = require('promise');
var main = require("./redisDataStore.js");
var addGithubUser = require("./addUser.js").addGithubUser;
var fs = require("fs")
var path = require("path")
var exec = require("exec")
var plotly = require('plotly')(process.env.PLOTLYUSER, process.env.PLOTLYTOKEN)
var exectoken = process.env.SLACKTOKEN
client = main.client;


var generalChannelId = 'C6VJQE5UY'
var botUserId = 'U6W8EEE8J'
var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
var myBot = controller.spawn({
 token: process.env.SLACKTOKEN,
}).startRTM()

// Collecting UserIDs
/*
myBot.api.users.list({},function(err,response) {
	var userIDs = new Object();
  for (var i = 0; i < response.members.length;i++){
  		userIDs[response.members[i].id] = response.members[i].name
  }

  console.log(userIDs)
})
*/
// Collecting ChannelIDs and channel names
/*myBot.api.channels.list({},function(err,response) {
	var channelIDs = new Object();
  for (var i = 0; i < response.channels.length;i++){
  		channelIDs[response.channels[i].id] = response.channels[i].name
  }
  console.log(channelIDs)
})
*/
// controller.hears('test',['mention', 'direct_mention','direct_message'], function(bot,message){
//     console.log(message);
//     bot.reply(message, "test")
// })


// const context = {
//   channel: 'C6VJQE5UY',
//   user: 'U6W8EEE8J'
// }

// myBot.startConversation(context, function(err, convo) {
//   convo.ask('Are you sure you want me to shutdown?');
// })

// var sayContext = {
//   text: 'my message text',
//   channel: 'C6VJQE5UY'
// }

// myBot.say(sayContext)

// calltotalNoOfCommits();
// noOfBrokenCommits();
// userMap();

function CreateBarGraph(filename, x_value, y_value, widthOfGraph, heightOfGraph){
  var trace1 = {
    x: x_value,
    y: y_value,
    marker: {color: ["#FF8C00"]},
    type: "bar"
  };

  var figure = { 'data': [trace1] };

  var imgOpts = {
    format: 'png',
    width: widthOfGraph,
    height: heightOfGraph

  };
  return  new Promise(function(resolve, reject){
    plotly.getImage(figure, imgOpts, function (error, imageStream) {
      if (error) return console.log (error);
      var fileStream = fs.createWriteStream(filename)
      imageStream.pipe(fileStream)
      //console.log("File written")
      resolve(filename)
    });
  })
}

function CreatePieGraph(filename, value, label, widthOfGraph, heightOfGraph,  callback){
  var trace1 = {
    values: value,
    labels: label,
    type: "pie"
  };
	console.log("in Pie "+value);
  var figure = { 'data': [trace1] };

  var imgOpts = {
    format: 'png',
    width: widthOfGraph,
    height: heightOfGraph

  };
  return  new Promise(function(resolve, reject){
	  //console.log("in Pie promise "+figure);
    plotly.getImage(figure, imgOpts, function (error, imageStream) {
	    //console.log("in get pie "+error+" "+imageStream);
      if (error) { console.log ("errrrrr: "+error);}
	    else{
	    //console.log("writing in pie");
      var fileStream = fs.createWriteStream(filename)
      imageStream.pipe(fileStream)
      //console.log("File written pie ")
      resolve(filename)}
    });
  })
}

function checkIfUserExists(slackId){
  return new Promise(function(resolve, reject){
    client.hexists('userMap', slackId , function(err, reply){
      // console.log("Reply is : " + reply);
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
  // console.log(authorName);
  return new Promise(function(resolve,reject){
    client.exists(authorName,function(err, reply){
      if(reply ==0){
        // console.log("Not blocked user "+authorName);
        client.hget('noOfBrokenCommitsToday', authorName, function(err, rep){

                // console.log("here "+rep);
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
      // console.log('{"GithubID ":"'+githubId+'"}');
    });
  }

controller.hears(['Hi','Hello'],['mention', 'direct_mention','direct_message'], function(bot,message)
{
	//console.log(message);
	bot.reply(message,"Hello! How can i help you today ? You can ask me any of the following questions: \n 1. What is the stable branch name ?\n 2. Grant me repo access \n 3. What is the repo health ? \n 4. What are my bad commits left for the day ?");

});

controller.hears('bad commits for the day',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  // console.log(message);
  checkIfUserExists(message.user).then(function(reply){
    // console.log("rep: "+reply);
    if(reply==0)
    	bot.reply(message,"Enter GitHubID starting with #");
    else{
    	client.hget('userMap', message.user, function(err, reply){
    		NoofBrokenCommitsToday(reply).then(function(resp){
			if(resp==="User is Blocked")
				bot.reply(message,"You are currently blocked");
			else
    			 	bot.reply(message, "Number of bad commits left: "+(5-(+resp)));
    		});
    	});
    }
  });
});


  controller.hears('#',['mention', 'direct_mention','direct_message'], function(bot,message)
	{
	  // console.log(message);
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
  client.get('stableBranchName', function(err, resp){
    if(resp=="master")
      bot.reply(message,"Master branch is stable. No build Failure");
    else {
      bot.reply(message,"Master branch is unstable. "+resp+" is the new stable branch.");
    }
  });
});

controller.hears('Grant me repo access',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  // console.log(message);
  checkIfUserExists(message.user).then(function(reply){
    // console.log("rep: "+reply);
    if(reply==0)
      bot.reply(message,"Enter GitHubID starting with # (dont add spaces)");
    else{
      client.hget('userMap', message.user, function(err, reply){
        var userToAdd = reply
        //console.log("reply: " + reply)
      CheckBlockedUser(userToAdd).then(function(checkblocked){
        //console.log("checkblocked: " + checkblocked)
        if(checkblocked==0){
          console.log(userToAdd)
          addGithubUser(userToAdd).then((data)=>{
            bot.reply(message, "You have been granted access to the repo :)");
          }).catch((val)=>{
		  //console.log(val)
		  bot.reply(message, "You already have access to the repo!");
		})
        }
        else{
          // console.log("User is "+reply);
          client.get(reply,function(err, timetoaccess){
            // console.log("time "+timetoaccess);
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

  // console.log(message);
  checkIfUserExists(message.user).then(function(reply){
    // console.log("rep: "+reply);
    if(reply==0)
    bot.reply(message,"Enter GitHubID starting with # (no spaces)");

    // After entering Github ID, the user should still be able to see the repo health. User-Specific report will be
    // showing null values, while repo specific values can still be visible to the new user.

    else{
      var result = "";
      // Displays number of broken commits for user
      client.hget('userMap', message.user, function(err, user){
        // console.log("usermap is : " + reply);

        NoofBrokenCommitsToday(user).then(function(resp){

          // result += "Your bad commits for the day: "+resp;
          // Displays stable branch name
          client.get('stableBranchName', function(err, res){

            result += " \n Stable Branch is "+ res;

            // bot.reply(message, result);
            // total number of commits, contributors and their commits
            // result="";
            client.hgetall('totalNoOfCommits',function(err,commits){

              var totcommitscount = 0
              var arr = commits;
              var nameArray = []
              var totalCommitArray = []
              var brokenCommitArray = []
              var i = 0;
              var repostats = "";
              for (var key in arr) {
                i+=1;
                if (arr.hasOwnProperty(key)) {
                  var val = arr[key];
                  totcommitscount+= +val;
                  repostats+= (key+" "+val+"\n");
                  nameArray.push(key)
                  totalCommitArray.push(val)
                }
              }

              // displays bad and good commits percentage
              client.hgetall('noOfBrokenCommits',function(err,brokencommits){

                var arr = brokencommits;
                var totbadcommitscount = 0;

                for (var key in arr) {
                  if (arr.hasOwnProperty(key)) {
                    var val = arr[key];
                    totbadcommitscount+= +val;
                  }
                }

                badcommitspercentage = (totbadcommitscount/totcommitscount)*100;
                goodcommitspercentage = 100 - badcommitspercentage;
                bot.reply(message, result);
                // result += "\nBad commits percentage on repo: " + badcommitspercentage.toFixed(2) + "% \n Good commmits percentage on repo: " + goodcommitspercentage.toFixed(2)+"%";

                //  ********Pie Chart*******
                CreatePieGraph('1.png', [badcommitspercentage, goodcommitspercentage], ['bad commits ','good commits'], 500,500).then(function (name){

                  exec('curl -F file=@'+name+' -F channels='+message.channel+' -F title=Commits_On_Repo -F token='+exectoken+' https://slack.com/api/files.upload', function(err,out,code){
                    if(err instanceof Error)
                    throw err;
                    //console.log("yayyy for pie!")
                  } )
                })
                //********Bar Chart*****
                //console.log(" Admin is  " + user + resp)

                if(user == 'abilala'){

                  CreateBarGraph('3.png', nameArray, totalCommitArray, 500, 500).then(function (name){
                    exec('curl -F file=@'+name+' -F channels='+message.channel+'  -F title=AllContributorsTotalCommits -F token='+exectoken+' https://slack.com/api/files.upload', function(err,out,code){
                      if(err instanceof Error)
                      throw err;
                      //console.log("yayyy!")
                    } )
                  })


                  // result+ = "List of Blocked Users \n"
                  var blockedUsers = ""
                  for(i =0; i< nameArray.length; i++){
                    var name = nameArray[i]
                   // console.log(" value is " + name)
                    client.get(name,function(err, blocked){
                     // console.log(" heree " + blocked+" "+name)
                      if(blocked){
                        var t = new Date(null); // Epoch
                        t.setTime(+blocked*1000);
                        blockedUsers += name + " "+ t
                        //console.log(blockedUsers + "blocked user ")
                        bot.reply(message,"Blocked User: "+blockedUsers)
                      }
                    })
                  }
                }
                else if(resp != "User is Blocked"){
                  CreateBarGraph('2.png', ['Total number of broken commits Today'], [resp], 500,500).then(function (name){
                    exec('curl -F file=@'+name+' -F channels='+message.channel+'  -F title=Broken_Commits_Today,Threshold=5 -F filename=Threshold=5 -F token='+exectoken+' https://slack.com/api/files.upload', function(err,out,code){
                      if(err instanceof Error)
                      throw err;
                      //console.log("yayyy!")
                    } )
                  }) }

                  else{
                    console.log("User is blocked")
                    client.get(user,function(err, timetoaccess){
                      // console.log("time "+timetoaccess);
                      var t = new Date(null); // Epoch
                      t.setTime(+timetoaccess*1000);
                      bot.reply(message, "You are blocked and can request next access after: " + t);
                    });

                  }
                })
              })
            })
          })
        })
      }
    })
  })

controller.hears('.*',['mention', 'direct_mention','direct_message'], function(bot,message)
{
	// console.log(message);

	bot.reply(message,"I'm sorry but i only understand the following commands: \n 1. Stable branch name\n 2. Grant me repo access \n 3. repo health \n 4. bad commits left for the day");

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

exports.myBot = myBot
