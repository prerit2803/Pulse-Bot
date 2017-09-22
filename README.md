# CSC510-Project
Software Engineering Fall 2017 Project
## Problem Statement
In a Continuous Integration environment, it is essential to maintain a healthy state of the deployment branch of a repository. Several buggy commits that fail the build may mess up the repository health and pose quite a challenge for developers to maintain a stable branch for deployment. Currently no concrete solutions exist to prevent this scenario. If a particular user responsible for successive buggy commits is not denied access, it may lead to a cascading effect and affect severely the health of the repository and working of other users in the long run.  

Thus, the problem we aim to address here is that of recording the activity of buggy commits of codes as well as the developer responsible for it. This also gives us an opportunity to identify and maintain the ‘health’ of the repository by checking every commit made by the contributors. The erring developer would be temporarily denied access to the repository if he/she makes consecutive bad commits to the repository. We shall provide a comprehensive report of the activities of all the contributors of the repositories which can also serve as metric for the developers accountability while committing code.

## Story Board

![alt text](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone1/StoryBoard.jpeg)

## Use Cases
**1. Tentative blocking of a buggy code committer** 

Preconditions:    
  Personal access token for GitHub repositories must be set.  
  Must have administrator access to the repository.
  
Main Flow:    
  User will be blocked from pushing if exceeds the number of broken code commits for a specific range of time.  
	User block will be revoked upon requesting the bot, provided a predetermined time has passed, otherwise manual intervention from admin     will be required.
  
Subflows:  
	[S1] User will ask for their status.  
	[S2] Bot will reply if user has push access or not.  
	[S3] If user has push access, after how many broken code commits will it be revoked.  
	[S4] If user is blocked, what date-time can access be provided again upon request.  
  
  **2. Maintain a branch with healthy code and lock it down until master branch is stable**  

Preconditions:    
  Personal access token for GitHub repositories must be set.  
	Jenkins CI must be up and running with the required jobs.  
	Bot must be authorized to edit jobs on Jenkins.  
  
Main Flow:    
  As soon as build on master branch fails, the bot creates a new branch with the last stable commit as its HEAD.  
	The bot also updates the branch name in the Jenkins Deploy job to the previously created stable branch.  
	When the master branch becomes stable again, bot updates the branch name in jenkins Deploy job back to master.  
  
Subflows:  
	[S1] User asks which is the current stable branch.  
	[S2] Bot provides the name of the current stable branch that can be deployed.
  
 **3. Create a report with a summary of number of commits per user and their segregation into broken or stable**    

Preconditions:      
  Mapping of Slack ID of users to their Github ID must be available.   
  
Main Flow:        
  A log of commit ID, who made the commit and commit build status will be tracked and stored by the bot.    
	A report containing number of commits per user and their segregation into broken or stable will be displayed.     

