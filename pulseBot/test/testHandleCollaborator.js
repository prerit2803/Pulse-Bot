var chai = require("chai")
var expect = chai.expect
var nock = require("nock")

var handleCollaborator = require("../handleCollaborator.js")
var data = require("./data/handleCollaboratorMockData.json")
var client = handleCollaborator.client

describe('helper functions', ()=>{
  // Function: checkUserExists(user)
  // Tests: userExists, userDoesNotExist
  describe('checkUserExists(user):success', ()=>{
    
    var testPresentUser= "mbehroo"
    var mockService1 = nock(handleCollaborator.urlRoot)
  	 .get('/repos/pulseBotProject/MavenVoid/collaborators/mbehroo')
  	 .reply(204,data.userExists)
    
    // TEST CASE: userExists
   	it('should verify that user exists as collaborator',(done)=>{
      handleCollaborator.checkUserExists(testPresentUser).then( (result)=>{
        expect(result).to.equal(testPresentUser)
        done()
      })
    })
  })
  describe('checkUserExists(user):failure', ()=>{
    var testAbsentUser= "mbehroo"
    var mockService = nock(handleCollaborator.urlRoot)
  	.get('/repos/pulseBotProject/MavenVoid/collaborators/mbehroo')
  	.reply(404,data.userDoesNotExist)
  	
    // TEST CASE: userDoesNotExist
    it('should throw error', (done)=>{
      handleCollaborator.checkUserExists(testAbsentUser).catch( (result)=>{
        //console.log(result)
        expect(result).to.equal("Couldn't find user!\n"+JSON.stringify(data.userDoesNotExist))
        done()
      })
    })   
  })
  // Function: removeUser(user)
  // Tests: userRemoved, userNotRemoved
  describe('removeUser(user): success', ()=>{
    var testUser= "mbehroo"
    var mockService2 = nock(handleCollaborator.urlRoot)
    .delete('/repos/pulseBotProject/MavenVoid/collaborators/mbehroo')
    .reply(204,data.userRemoved)
    
    // TEST CASE: userRemoved
    it('should throw error', (done)=>{
      handleCollaborator.removeUser(testUser)
      .then( (result)=>{
        expect(result).to.equal(testUser)
        done()
      })
    })   
  })
  describe('removeUser(user):failure', ()=>{   
    var testUser= "mbehroo"
    var mockService1 = nock(handleCollaborator.urlRoot)
    .delete('/repos/pulseBotProject/MavenVoid/collaborators/mbehroo')
    .reply(404,data.userNotRemoved)
    
    // TEST CASE: userNotRemoved
    it('should throw error',(done)=>{
      handleCollaborator.removeUser(testUser)
      .catch( (result)=>{
        //console.log(result);
        expect(result).to.equal("Couldn't remove user!\n"+JSON.stringify(data.userNotRemoved))
        done()
      })
    })
  })
})

describe('main function', ()=>{
  // Function: handleUser(user)
  // Tests: success, failure
  describe('handleUser(user): success', ()=>{
    
    var testUser= "mbehroo"  
    //create fake redis client and set a key for user
    before( ()=>{
      client.set(testUser,1)
    })
    var mockUserExists = nock(handleCollaborator.urlRoot)
      .get('/repos/pulseBotProject/MavenVoid/collaborators/mbehroo')
      .reply(204,data.userExists)
    var mockUserRemoved = nock(handleCollaborator.urlRoot)
      .delete('/repos/pulseBotProject/MavenVoid/collaborators/mbehroo')
      .reply(204,data.userRemoved)
    
    // TEST CASE: success
    it('should successfully remove user', (done)=>{
      handleCollaborator.handleUser(testUser)
      .then( (result)=>{
        expect(result).to.equal(testUser)
        done()
      })
    }) 
  })
  describe('handleUser(user): do nothing', ()=>{
    
    var testUser= "mbehroo"
    
    //create fake redis client and set a key for user
    before( ()=>{
      client.del(testUser,0)
    })

    var mockUserExists = nock(handleCollaborator.urlRoot)
      .get('/repos/pulseBotProject/MavenVoid/collaborators/mbehroo')
      .reply(204,data.userExists)
    var mockUserRemoved = nock(handleCollaborator.urlRoot)
      .delete('/repos/pulseBotProject/MavenVoid/collaborators/mbehroo')
      .reply(204,data.userRemoved)
      
    // TEST CASE: do nothing
    it('should do nothing', (done)=>{
      handleCollaborator.handleUser(testUser)
      .catch( (result)=>{
        expect(result).to.equal("No action taken for user "+testUser)
        done()
      })
    })
  })
})