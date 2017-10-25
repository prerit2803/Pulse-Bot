var express = require('express')
var fs      = require('fs')
var app = express()
var bodyParser = require('body-parser')
var successCommitID = ""
var failCommitID = ""

var github = require("./github.js");
var redis = require("./redisDataStore.js");
var handleCollaborator = require("./handleCollaborator.js");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// github.updateStableBranchName("master").then(console.log).done()

// app.get('/success', function(req, res) {
//   	res.writeHead(200, {'content-type':'text/html'});
//   	res.write('last Successful Commit ID: ');
//   	res.write(successCommitID);
//   	res.end();
// });

// app.get('/fail', function(req, res) {
//   	res.writeHead(200, {'content-type':'text/html'});
//   	res.write('last failed Commit ID: ');
//   	res.write(failCommitID);
//   	res.end();
// });

app.post('/successBuild', function(req, res) {
  	const body = req.body
  	console.log(body);
    redis.BuildSucceded(body)
    .then( (user)=>{
        res.set('Content-Type', 'text/plain')
        res.send('haha')
        console.log("in redis success "+user);
    }).catch((value)=>{
        console.log(value)
    })


    github.refactorOnStableBuild(body).then(function(data){
      // res.set('Content-Type', 'text/plain')
      // res.send('')
      // return redis.BuildSucceded(body);
    }).catch(function(data){
      // res.set('Content-Type', 'text/plain')
      // res.send('')
      console.log("in catch of post successBuild" + data)
    })
});

app.post('/failBuild', function(req, res) {
  	const body = req.body
  	console.log(body);

    redis.BuildFailed(body)
    .then( (user)=>{
        res.set('Content-Type', 'text/plain')
        res.send('saddy')
    }).catch((value)=>{
        console.log(value)
    })


    handleCollaborator.handleUser(body.AuthorName)
    .then( (user)=>{
        //console.log('\n'+Date().toString()+":\t"+user)
        //handleCollaborator.addUser(user)
    }).catch((value)=>{
        console.log(value)
    })

    github.refactorOnUnstableBuild(body).then(function(data){
      res.set('Content-Type', 'text/plain')
      res.send('')
    }).catch(function(data){
      res.set('Content-Type', 'text/plain')
      res.send('')
      console.log("in catch of post failBuild" + data)
    })
});

app.listen(3000, function (err) {
  if (err) {
    throw err
  }
  console.log('Server started on port 3000')
})
