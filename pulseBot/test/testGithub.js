var chai = require("chai");
var expect = chai.expect;
var nock = require("nock");

var github = require("../github.js");

var data = require("./data/githubMockData.json")
console.log(data.createBranchSuccess.statusCode)
var orgName = github.orgName
var repoName = github.repoName
var branchName = "testStableBranch"
var commitID = "testCommitID"

describe('testcreateNewBranch', function(){
  describe('createNewBranch()', function(){
    var mockService = nock(github.urlRoot)
  	.post("/repos/pulseBotProject/MavenVoid/git/refs")
  	.reply(data.createBranchSuccess.statusCode, data.createBranchSuccess);
   	// TEST CASE
   	it('should return branchName', function(done){
      github.createBranch(orgName, repoName, branchName, commitID).then(function (results){
        expect(results).to.equal(branchName)
        done()
      });
    });

    var mockService = nock(github.urlRoot)
  	.post("/repos/pulseBotProject/MavenVoid/git/refs")
  	.reply(data.createBranchFail.statusCode, data.createBranchFail);
  	// TEST CASE
    it('should return error', function(done){
      github.createBranch(orgName, repoName, branchName, commitID).catch(function (results){
      	console.log(results)
        expect(results).to.equal("error in createBranch: " + JSON.stringify(data.createBranchFail))
        done()
      });
    });
  });
})

describe('testdeleteBranch', function(){
  describe('deleteBranch()', function(){
    var mockService = nock(github.urlRoot)
  	.delete("/repos/pulseBotProject/MavenVoid/git/refs/heads/testStableBranch")
  	.reply(data.deleteBranchSuccess.statusCode, data.deleteBranchSuccess);
   	// TEST CASE
   	it('should return branchName', function(done){
      github.deleteBranch(orgName, repoName, branchName).then(function (results){
        expect(results).to.equal(branchName)
        done()
      });
    });

    var mockService = nock(github.urlRoot)
  	.delete("/repos/pulseBotProject/MavenVoid/git/refs/heads/testStableBranch")
  	.reply(data.deleteBranchFail.statusCode, data.deleteBranchFail);
  	// TEST CASE
    it('should return error', function(done){
      github.deleteBranch(orgName, repoName, branchName).catch(function (results){
      	console.log(results)
        expect(results).to.equal("error in deleteBranch: " + JSON.stringify(data.deleteBranchFail))
        done()
      });
    });
  });
})

describe('addBranchProtection', function(){
  describe('addBranchProtection()', function(){
    var mockService = nock(github.urlRoot)
  	.put("/repos/pulseBotProject/MavenVoid/branches/testStableBranch/protection")
  	.reply(data.addBranchProtectionSuccess.statusCode, data.addBranchProtectionSuccess);
   	// TEST CASE
   	it('should return branchName', function(done){
      github.addBranchProtection(orgName, repoName, branchName).then(function (results){
        expect(results).to.equal(branchName)
        done()
      });
    });

    var mockService = nock(github.urlRoot)
  	.put("/repos/pulseBotProject/MavenVoid/branches/testStableBranch/protection")
  	.reply(data.addBranchProtectionFail.statusCode, data.addBranchProtectionFail);
  	// TEST CASE
    it('should return error', function(done){
      github.addBranchProtection(orgName, repoName, branchName).catch(function (results){
      	console.log(results)
        expect(results).to.equal("error in addBranchProtection: " + JSON.stringify(data.addBranchProtectionFail))
        done()
      });
    });
  });
})

describe('removeBranchProtection', function(){
  describe('removeBranchProtection()', function(){
    var mockService = nock(github.urlRoot)
  	.delete("/repos/pulseBotProject/MavenVoid/branches/testStableBranch/protection")
  	.reply(data.deleteBranchProtectionSuccess.statusCode, data.deleteBranchProtectionSuccess);
   	// TEST CASE
   	it('should return branchName', function(done){
      github.removeBranchProtection(orgName, repoName, branchName).then(function (results){
        expect(results).to.equal(branchName)
        done()
      });
    });

    var mockService = nock(github.urlRoot)
  	.delete("/repos/pulseBotProject/MavenVoid/branches/testStableBranch/protection")
  	.reply(data.deleteBranchProtectionFail.statusCode, data.deleteBranchProtectionFail);
  	// TEST CASE
    it('should return error', function(done){
      github.removeBranchProtection(orgName, repoName, branchName).catch(function (results){
      	console.log(results)
        expect(results).to.equal("error in removeBranchProtection: " + JSON.stringify(data.deleteBranchProtectionFail))
        done()
      });
    });
  });
})