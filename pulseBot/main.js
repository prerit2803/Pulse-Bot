var express = require('express')
var fs      = require('fs')
var app = express()
var bodyParser = require('body-parser')
var successCommitID = ""
var failCommitID = ""

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/success', function(req, res) {
  	res.writeHead(200, {'content-type':'text/html'});
  	res.write('last Successful Commit ID: ');
  	res.write(successCommitID);
  	res.end();
});

app.get('/fail', function(req, res) {
  	res.writeHead(200, {'content-type':'text/html'});
  	res.write('last failed Commit ID: ');
  	res.write(failCommitID);
  	res.end();
});

app.post('/successBuild', function(req, res) {
  	const body = req.body
  	console.log(body)
  	successCommitID = body.commitID
  	res.set('Content-Type', 'text/plain')
  	res.send('here')
});

app.post('/failBuild', function(req, res) {
  	const body = req.body
  	console.log(body)
  	failCommitID = body.commitID
  	res.set('Content-Type', 'text/plain')
  	res.send('here')
});

app.listen(3000, function (err) {
  if (err) {
    throw err
  }
  console.log('Server started on port 3000')
})
