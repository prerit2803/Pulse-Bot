var express = require('express')
var fs      = require('fs')
var app = express()
var bodyParser = require('body-parser')
var successCommitID = ""
var failCommitID = ""

var github = require("./github.js");

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
  	console.log(body)
    github.refactorOnStableBuild(body).then(function(data){
      res.set('Content-Type', 'text/plain')
      res.send('')
    }).catch(function(data){
      res.set('Content-Type', 'text/plain')
      res.send('')
      console.log("in catch of post successBuild" + data)
    })
});

app.post('/failBuild', function(req, res) {
  	const body = req.body
  	console.log(body)
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
