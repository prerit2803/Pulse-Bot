var chai = require("chai");
var expect = chai.expect;
var nock = require("nock");

var main = require("../github.js");

var data = require("./data/githubMockData.json")

var orgName = github.orgName
var repoName = github.repoName
var branchName = "testStableBranch"
var commitID = "testCommitID"

describe('testMain', function(){
  describe('createNewBranch()', function(){
    var mockService = nock(github.urlRoot)
  	.get("/repos/" + orgName + "/" + repoName + "/branches/" + branchName + "/protection")
  	.reply(200, JSON.stringify(data.createBranchSuccess));
   	// TEST CASE
   	it('should return branchName', function(done) {

      github.createBranch(orgName, repoName, branchName, commitID).then(function (results) 
      {
        expect(results).to.equal(branchName)
        //test case is done. Need this for asychronous operations.
        done();
      });
    });
  });
})