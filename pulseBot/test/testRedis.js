var chai = require("chai");
var expect = chai.expect;


var main = require("../redisDataStore.js");
var data = require("./data/redismock.json");

var client = main.client;

var mockdata = data.build;
commitID = mockdata[0].commitID;
authorName = mockdata[0].AuthorName;

describe('addCommitId()', function(){

 	it('should return commitID', function(done) {
    main.addCommitId(commitID,authorName).then(function (results){
      expect(results).to.equal(commitID);
      done();
    });
  });
});

describe('addStatus()', function(){

 	it('should return commitID', function(done) {
    main.addStatus(commitID,authorName).then(function (results)
    {
      expect(results).to.equal(commitID);
      done();
    });
  });
});

describe('addBrokenCommits()', function(){

 	it('should return updatedreply', function(done) {
    main.addBrokenCommits(authorName).then(function (results)
    {
      expect(results).to.equal(1);
      done();
    });
  });
});

describe('totalNoOfCommits()', function(){

  it('should return value', function(done) {
    main.totalNoOfCommits(authorName).then(function (results)
    {
      expect(results).to.equal(1);
      //test case is done. Need this for asychronous operations.
      done();
    });
  });

  it('should return updatedreply', function(done) {
   main.addBrokenCommits(authorName).then(function (results)
   {
     main.addBrokenCommits(authorName).then(function (results){
       expect(results).to.equal(2);
     });

     //test case is done. Need this for asychronous operations.
     done();
   });
 });
});

describe('NoOfBrokenCommits()', function(){

  it('should add the first broken commit', function(done) {
    main.NoOfBrokenCommits(authorName).then(function (results){
      expect(results).to.equal(1);
      //test case is done. Need this for asychronous operations.
      done();
    });
  });