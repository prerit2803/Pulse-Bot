var express = require('express')
var fs      = require('fs')
var app = express()
var bodyParser = require('body-parser')

var github = require("./github.js");
var redis = require("./redisDataStore.js");
var handleCollaborator = require("./handleCollaborator.js");
var bot = require("./slackBot.js")

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/successBuild', function(req, res) {
  	const body = req.body

    github.refactorOnStableBuild(body).then(function(data){
        res.set('Content-Type', 'text/plain')
        res.send('successBuild Successful')
    }).catch(function(data){
        res.set('Content-Type', 'text/plain')
        res.send('successBuild Unsuccessful')
        console.log("in catch of post successBuild\n" + data)
    })

    redis.BuildSucceded(body).then(function(value){
      console.log("in /successBuild redis success "+ value);
    }).catch(function(value){
      console.log("in /successBuild redis failure "+ value);
    });
});

app.post('/failBuild', function(req, res) {
  	const body = req.body

    github.refactorOnUnstableBuild(body).then(function(data){
      res.set('Content-Type', 'text/plain')
      res.send('failBuild Successful')
    }).catch(function(data){
      res.set('Content-Type', 'text/plain')
      res.send('failBuild Unsuccessful')
      console.log("in catch of post failBuild\n" + data)
    })

    redis.BuildFailed(body).then( (value)=>{
      console.log(body.AuthorName)
      return handleCollaborator.handleUser(body.AuthorName)
    }).then((value)=>{
      console.log("in /failBuild redis success "+ value);
    }).catch(function(value){
      console.log("in /failBuild redis failure "+ value);
    })
});

app.listen(3000, function (err) {
  if (err) {
    throw err
  }
  console.log('Server started on port 3000')
})