// Slack token: xoxb-259933162213-cuEXH2HjVx5ZEkR5BKnSJB3i

var Botkit = require('botkit');



var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  token: 'xoxb-259933162213-cuEXH2HjVx5ZEkR5BKnSJB3i',
}).startRTM()

controller.hears('bad commits',['mention', 'direct_mention','direct_message'], function(bot,message) 
{
  console.log(message);
  bot.reply(message,"You have 5 bad commits left.");

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
