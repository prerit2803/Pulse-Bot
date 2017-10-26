This file contains the description of and link to all the deliverables.


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
## Task Tracking
We used Trello for task tracking. A weekly itinerary of tasks peprformed can be found in the [worksheet.md.](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone2/WORKSHEET.md)

## Screencast
