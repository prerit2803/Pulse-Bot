# Design Milestone
#### Team
+ Akriti Bilala: abilala@
+ Ankur Saxena: asaxena3@
+ Jaydeep Rane: jrane@
+ Prerit Bhandari: pbhanda2@
+ Shaishav Shah: sshah11@

## Problem Statement
In a Continuous Integration environment, it is essential to maintain a healthy state of the deployment branch of a repository. Several buggy commits that fail the build may mess up the repository health and pose quite a challenge for developers to maintain a stable branch for deployment. Currently no concrete solutions exist to prevent this scenario. If a particular user responsible for successive buggy commits is not denied access, it may lead to a cascading effect and affect severely the health of the repository and working of other users in the long run.  

Thus, the problem we aim to address here is that of recording the activity of buggy commits of codes as well as the developer responsible for it. This also gives us an opportunity to identify and maintain the ‘health’ of the repository by checking every commit made by the contributors. The erring developer would be temporarily denied access to the repository if he/she makes consecutive bad commits to the repository. We shall provide a comprehensive report of the activities of all the contributors of the repositories which can also serve as metric for the developers accountability while committing code.  

## Bot Description
We are designing a bot capable of maintaining the last healthy state of a repository and tracking the number of buggy commits made by a contributors of a repository. These capabilities are extended to a chatbot which can perform multiple tasks like tentatively revoking their permission to commit given they cross a threshold count, generate a report for all users, chat with a user. It interacts, in background, with a Continuous Integration service (Jenkins) to get and track the status of a build triggered by a collaborator’s commit on a git repo. The bot maintains the statistics for each user and responds to user queries on Slack.    

When a user commits a code, it gets automatically queued for a build job. If the build fails, users debugs and keeps committing until it’s fixed, thereby possibly doing more buggy commits in the process. Our bot runs the job of maintaining the status of each build perpetuated by a commit and maintains a safe branch after each commit. The best feature of the bot is that it automates the result tracking of each commits and can answer users on Slack portal through a chat. This makes the process of tracking seamless and hence a good solution for any industry.    

The bot can be categorized as a Space Responder, since it maintains user contexts for each Slack user and responds them with their respective statistics. Also, the bot will follow an Event Driven  Architecture which acts in response to the build job triggered by user commits. Since it runs as a service in the background that interacts with the Continuous Integration tools it can be related to the DevOps bot discussed in the class.   

### Use Cases
```
Use Case: Tentative blocking of a buggy code committer  

1. Preconditions:    
	Personal access token for GitHub repositories must be available to the bot.  
	Bot must have administrator access to the repository.
  
2. Main Flow:    
	User will be blocked from pushing [S1].  
	User block will be revoked upon requesting the bot [S2], otherwise manual intervention from admin will be required [S3].
  
3. Subflows:  
	[S1] User commits broken code and exceeds the threshold for a day.
	[S2] User requests the bot to grant push access after a day.
	[S3] If user is blocked, at what date-time can access be provided again upon request.  
	 
4. Alternative Flow:  
	[E1] No user is present who exceeds the number of broken commit threshold.
  ```

```
Use Case: Create a new branch with healthy code and lock it down until master branch is unstable.  

1. Preconditions:    
	Personal access token for GitHub repositories must be available to the bot.  
	Jenkins CI must be up and running with the required jobs.  
	Bot must be authorized to edit jobs on Jenkins.
  
2. Main Flow:    
	As soon as build on master branch fails, the bot creates a new branch with the last stable commit as its HEAD.  
	When the master branch becomes stable again, bot deletes the branch that was created in previous step.  
	User asks which is the current stable branch [S1].
  
3. Subflows:  
	[S1] Bot provides the name of the current stable branch that can be deployed.  
	 
4. Alternative Flow:  
	[E1] No broken code is commited on master branch.
  ```
```
Use Case: Create a report with a summary of number of commits per user and their segregation into broken or stable.    

1. Preconditions:      
	Mapping of Slack ID of users to their Github ID must be populated in the bot.  
  
2. Main Flow: 
	Manager requests repo health report [S1].
	
3. Subflows:
	[S1] A report containing number of commits per user and their segregation into broken or stable will be returned. 
	
3. Alternative Flow:  
	[E1] Repo is empty without any commits.
	[E2] Repo has no collaborators.

```

### Design Sketches
#### Story Board

![alt text](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone1/StoryBoard.jpeg)

#### Wire Frame

These wireframes depict the manner in which the bot responds to different types of users (blocked/not blocked) on the slack interface.  

![alt text](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone1/Wireframe1.gif)  



![alt text](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone1/Wireframe2.gif)

### Architecture Design + Additional Patterns  

The Architecture Design Pattern for this bot resembles the **Event Systems - Explicit Invocation pattern**.  
In this pattern, there are multiple events that can be termed as Explicit Invocation. Following are a couple of examples illustrating the explicit event driven architecture:  

+ **Explicit Event**:  
A commit to the master branch.  
**Event Handler**:  
Bot  
**Action taken**:  
	If the commit leads to build failure, bot creates a new branch with stable version of master and locks it down till master branch is bug free.  
	If build is successful, then the bot updates the report which is readily available on request by any user.  

+ **Explicit Event**:  
Exceeding limit of buggy commits by a user.  
**Event Handler**:  
Bot  
**Action taken**:  
	Blocking the user for stipulated amount of time.  

#### Architecture Components

+ **Jenkins**: This is a Continuous Integration service that has already been established and is running on the build server. Our bot interacts with the Jenkins service to get status of the build jobs initiated by a commit.  

+ **REDIS**: An in-memory fast data structure to store the stats collected by the bot. The bot will use it to time blocked users, total count, daily counts for each user. Alternatively, any database will suffice given it  allows setting an expiration time for a key and is fast.  

+ **Slack**: Slack provides an interface for the users to interact with our bot. 

+ **PulseBot**: The key entity of our project which interacts with Slack, Github, Jenkins, and Redis to provide solution to the user. The Pulse Bot parses the user chat from Slack portal and performs required action. It also maintains a mapping of Slack ID to Github ID of all users.  


#### Constraints
+ User cannot voluntarily revoke temporary block imposed by bot.  
+ It needs the Jenkins build Job to use the GitHub and Maven plugin.  
+ It would not be able to track the commits if they are squashed on GitHub.  
