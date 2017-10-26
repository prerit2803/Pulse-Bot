## 3 Use Cases


### Use Case 1: Create a new branch with healthy code and lock it down until master branch is unstable.  

_**1. Preconditions:**_  
+ Personal access token for GitHub repositories must be available to the bot.  
+	Jenkins CI must be up and running with the required jobs.  
+	Bot must be authorized to edit jobs on Jenkins.
  
_**2. Main Flow:**_    
	As soon as build on master branch fails, the bot creates a new branch with the last stable commit as its HEAD.  
	When the master branch becomes stable again, bot deletes the branch that was created in previous step.  
	User asks which is the current stable branch [S1].
  
_**3. Subflows:**_  
	[S1] Bot provides the name of the current stable branch that can be deployed.  
	 
_**4. Alternative Flow:**_  
	[E1] No broken code is commited on master branch.

  
### Use Case 2: Tentative blocking of a buggy code committer  

_**1. Preconditions:**_  
+	Personal access token for GitHub repositories must be available to the bot.  
+	Bot must have administrator access to the organization.
  
_**2. Main Flow:**_  
 User commits code to the repository [S1], User will be removed temporarily from the collaborator of the repository [S2],
 Manual intervention from admin will be required to add the user back as collaborator [S3].
  
_**3. Subflows:**_  
	[S1] User commits broken code and exceeds the threshold for a day.  
	[S2] User requests for push access after a day.  
	[S3] If user is blocked, bot can added it back after 24 hours, otherwise an admin must manually add user.  
	 
_**4. Alternative Flow:**_  
	[E1] No user is present who exceeds the number of broken commit threshold.
  
### Use Case 3: Create a report with a summary of number of commits per user and their segregation into broken or stable.    

_**1. Preconditions:**_      
+	Mapping of Slack ID of users to their Github ID must be populated in the bot.  
  
_**2. Main Flow:**_  
	Manager requests repo health report [S1].
	
_**3. Subflows:**_  
	[S1] A report containing number of commits per user and their segregation into broken or stable will be returned. 
	
_**4. Alternative Flow:**_  
	[E1] Repo is empty without any commits.  
	[E2] Repo has no collaborators.



## Mocking
## Bot Implementation
## Selenium testing of each use case
### Use Case 1: Maintaining a stable branch

#### Test Case 1: Create a stable branch
[See the full selenium test case here](https://github.ncsu.edu/sshah11/CSC510-Project/blob/9ec9b4c0dcb4c3dceec2ba787c0f20b615a020ce/seleniumTests/src/test/java/selenium/tests/githubBranchTest.java#L78)

_**Test Case flow:**_

+ flow1
```
@Test
public void createStableBranchTest() 

	...  //
	
}
```

+ flow2
```
@Test
public void testUserRemoved(){

	...  // 
}

```
+ flow3
```
@Test
public void createStableBranchTest() {
	...  // 
	
}
```
Success of the test case shows that

#### Test Case 2: Delete a stable branch if master is stable
[See the full selenium test case here](https://github.ncsu.edu/sshah11/CSC510-Project/blob/9ec9b4c0dcb4c3dceec2ba787c0f20b615a020ce/seleniumTests/src/test/java/selenium/tests/githubBranchTest.java#L111)

_**Test Case flow:**_

+ flow1
```
@Test
public void deleteStableBranchTest(){

	...  //
	
}
```

+ flow2
```
@Test
public void deleteStableBranchTest(){
	...  // 
}

```
+ flow3
```
@Test
public void deleteStableBranchTest(){
	...  // 
	
}
```
Success of the test case shows that


### Use Case 2: Tentative blocking a buggy user

#### Test Case 1: Blocking a user making more buggy commits than the threshold (5 in our case).

[See the full selenium test case here](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone2/seleniumTests/src/test/java/selenium/tests/CollaboratorTest.java#L66)

_**Test Case flow:**_

+ Add user as a collaborator in the repository
```
@Test
public void testUserRemoved(){

	...  // reach the settings-> Collaborators & Teams  page
	
	// Add buggyUser to as a collaborator
	wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@id='search-member']")));
	WebElement inputBox=driver.findElement(By.xpath("//input[@id='search-member']"));
	inputBox.sendKeys(buggyUser);	//buggyUser= "mbehroo"
	inputBox.submit();
}
```
Once the collaborator is added, we move to next flow,  

+ Simulate the user committing buggy code
```
@Test
public void testUserRemoved(){

	...  // add buggyUser
	
	sendHTTPrequest(6,buggyUser);	//5 is the threshold of buggy commits. So we send 6 commits.
}

private void sendHTTPrequest(int commits, String user) throws ClientProtocolException, IOException {
		while(commits-- !=0) {
			CloseableHttpClient httpClient = HttpClientBuilder.create().build();
			HttpPost httpPost = new HttpPost("http://13.59.112.43:3000/failBuild");
			StringEntity params =new StringEntity("{\"commitID\":\"commitID\","
					+ "\"AuthorName\":\""+user+"\","
					+ "\"source\":\"SeleniumTest\"} ");
			httpPost.setEntity(params);
			httpPost.setHeader("Content-type", "application/json");
			httpClient.execute(httpPost);
		}
	}
```
This triggers the bot function to remove the buggyUser i.e. mbehroo.
Finally we test,  
+ Check if the PulseBot removes the user or not
```
@Test
public void testUserRemoved(){

	...  // send 6 buggy commits
	
	//check collaborator
	commiterXpath="//a[@href='/"+ buggyUser +"']";
	List<WebElement> commiter1=driver.findElements(By.xpath(commiterXpath));
	assertEquals(commiter1.size(),0) ;	//user removed successfully!
	Thread.sleep(5000);

}
```
Success of the test case shows that the bot can sucessfully track number of buggy commits made by user and remove it from the list of repository collaborators.

#### Test Case 2: Not blocking a user making less buggy commits than the threshold (5 in our case).

[See the full selenium test case here](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone2/seleniumTests/src/test/java/selenium/tests/CollaboratorTest.java#L124)

_**Test Case flow:**_

+ Add a user as a collaborator in the repository
```
@Test
public void testUserNotRemoved(){

	...  // reach the settings-> Collaborators & Teams  page
	
	// Add buggyUser to as a collaborator
	wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@id='search-member']")));
	WebElement inputBox=driver.findElement(By.xpath("//input[@id='search-member']"));
	inputBox.sendKeys(notBuggyUser);	//buggyUser= "ntabass"
	inputBox.submit();
}
```
Once the collaborator is added, we move to next flow,  

+ Simulate the user committing buggy code
```
@Test
public void testUserNotRemoved(){

	...  // add notbuggyUser
	
	sendHTTPrequest(1,notBuggyUser);	//5 is the threshold of buggy commits. So we send 1 commits.
}

private void sendHTTPrequest(int commits, String user) throws ClientProtocolException, IOException {
		while(commits-- !=0) {
			CloseableHttpClient httpClient = HttpClientBuilder.create().build();
			HttpPost httpPost = new HttpPost("http://13.59.112.43:3000/failBuild");
			StringEntity params =new StringEntity("{\"commitID\":\"commitID\","
					+ "\"AuthorName\":\""+user+"\","
					+ "\"source\":\"SeleniumTest\"} ");
			httpPost.setEntity(params);
			httpPost.setHeader("Content-type", "application/json");
			httpClient.execute(httpPost);
		}
	}
```
This triggers the bot function to handle the notBuggyUser i.e. ntabass.
Finally we test,  
+ Check if the PulseBot removes the user or not
```
@Test
public void testUserNotRemoved(){

	...  // send 1 buggy commit
	
	//check collaborator
	commiterXpath="//a[@href='/"+ notBuggyUser +"']";
	List<WebElement> commiter1=driver.findElements(By.xpath(commiterXpath));
	assertEquals(commiter1.size(),1) ;	//user not removed!
	Thread.sleep(5000);

}
```
Success of the test case shows that the bot can sucessfully track number of buggy commits made by user and doesn't remove it from the list of repository collaborators since it didn't cross the threshold.

### Use Case 3: Create a summary report

#### Test Case 1: Testing for the correct values generated in Report
[See the full selenium test case here](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone2/seleniumTests/src/test/java/selenium/tests/RedisTest.java#L70)

_**Test Case flow:**_

+ flow1
```
@Test
public void redisTest(){
	alternatePath();
	buildSuccess();
	buildFail();
}

```
We are running 3 testcases one for alternate path, one when the build succeeds and another one when build fails.
+ subFlow1
```
public void alternatePath(){
...
	String repoHealthStatus = response.get(response.size()-1).getText();
	String[] parts = repoHealthStatus.split("\n");
	char valueOfBadCommit = parts[0].charAt(parts[0].length()-1);
	String[] branch = parts[1].split(" ");
	String branchName = branch[3];
		
	assertEquals(valueOfBadCommit, '0');
	assertEquals(branchName, "master");
	assertEquals(parts.length, 3);
...
}
```
Our subflow1 is the alternate path of the user case when the repo is empty without any commits. When repo is empty without any commits then the value of bad commit will be 0 and stable branch name is master.

+ subFlow2
```
public void buildSuccess(){
...
	List <WebElement> response = driver.findElements(		
    		By.xpath("//span[contains(.,'Your bad commits for the day:')]"));
    		assertNotNull(response);
    		String repoHealthStatus = response.get(response.size()-1).getText();
    		String[] parts = repoHealthStatus.split("\n");
    		char valueOfBadCommit = parts[0].charAt(parts[0].length()-1);
    		String[] branch = parts[1].split(" ");
    		String branchName = branch[3];
    		char authorCommits = parts[3].charAt(parts[3].length()-1);
    		
    		assertEquals(valueOfBadCommit, '0');
    		assertEquals(authorCommits, '1');
    		assertEquals(branchName, "master");
...
}
```
Our subflow2 is calling the buildSuccess function. In this case the build succeeds and the value of bad commits becomes 0 and total number of commits are set to 1.

+ subFlow3
```
public void buildFail(){
...
	String repoHealthStatus = response.get(response.size()-1).getText();
	String[] parts = repoHealthStatus.split("\n");
	char valueOfBadCommit = parts[0].charAt(parts[0].length()-1);
	String[] branch = parts[1].split(" ");
	String branchName = branch[3];
	char authorCommits = parts[3].charAt(parts[3].length()-1);

	assertEquals(valueOfBadCommit, '1');
	assertEquals(authorCommits, '2');
	assertTrue(branchName.contains("testStable"));
...
}
```
Our subflow3 is calling the buildFail function. In this case the build fails and the value of bad commits becomes 1 and total number of commits are set to 2.

## Task Tracking
We used Trello for task tracking. A weekly itinerary of tasks performed can be found in the [worksheet.md.](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone2/WORKSHEET.md)

## Screencast
