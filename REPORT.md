# Report: PulseBot
## Problem Statement
In a Continuous Integration environment, it is essential to maintain a healthy state of the deployment branch of a repository. Several buggy commits that fail the build may mess up the repository health and pose quite a challenge for developers to maintain a stable branch for deployment. Currently no concrete solutions exist to prevent this scenario. If a particular user responsible for successive buggy commits is not denied access, it may lead to a cascading effect and affect severely the health of the repository and working of other users in the long run.  
Thus, the problem we aim to address here is that of recording the activity of buggy commits of codes as well as the developer responsible for it. This also gives us an opportunity to identify and maintain the ‘health’ of the repository by checking every commit made by the contributors. The erring developer would be temporarily denied access to the repository if he/she makes consecutive bad commits to the repository. We shall provide a comprehensive report of the activities of all the contributors of the repositories which can also serve as metric for the developers accountability while committing code.  
## Solution
We have designed a bot capable of maintaining the last healthy state of a repository and tracking the number of buggy commits made by a contributors of a repository. These capabilities are extended to a chatbot which can perform multiple tasks like tentatively revoking their permission to commit given they cross a threshold count, generate a report for all users, chat with a user. It interacts, in background, with a Continuous Integration service (Jenkins) to get and track the status of a build triggered by a collaborator’s commit on a git repo. The bot maintains the statistics for each user and responds to user queries on Slack.  
When a user commits a code, it gets automatically queued for a build job. If the build fails, users debugs and keeps committing until it’s fixed, thereby possibly doing more buggy commits in the process. Our bot runs the job of maintaining the status of each build perpetuated by a commit and maintains a safe branch after each commit. The best feature of the bot is that it automates the result tracking of each commits and can answer users on Slack portal through a chat. This makes the process of tracking seamless and hence a good solution for any industry. 
 
![alt text](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone5/images/fig1.png "Architecture")

**Fig 1: Architecture
We used botkit in nodejs to connect with slack. The bot receives build status from jenkins via a rest API hosted by the bot. After receiving data from Jenkins, the bot updates the data in redis as well as notifies in the slack’s general channel if there is a change in the stable branch.**

## Features
Maintaining a healthy branch in the repo at any time 
As soon as build on master branch fails, the bot creates a new branch with the last stable commit as its HEAD.

Fig 2: When a build fails, bot creates a new healthy branch
Bot also notifies in the slack general channel about the new healthy branch.

Fig 3: Bot notifies on Slack about the new healthy branch
When the master branch becomes stable again, bot deletes the branch that was created in previous step.

Fig 4: Bot deletes the branch as soon as master become stable
Bot notifies in slack general channel when the master branch is stable again.

Fig 5: Bot notifies on Slack when the master branch become stable again
User asks which is the current stable branch

Fig 6: Bot replies with current stable branch name
Limiting buggy code commits
User commits broken code and exceeds the threshold for a day.

Fig 7: Bot notifies when a user is nearing threshold
User will be removed temporarily from the collaborator of the repository.

Fig 8: Bot notifies when the user gets removed from the collaborator
User “pbhanda2” is removed from the collaborators list on the repo.

Fig 9: User “pbhanda2” is removed from the collaborator’s list on GitHub as he crossed the threshold of broken commits on that day
User can request next access after 24 hours through bot.

Fig 10: When the user is still blocked and request access

Fig 11: When the user request access after 24 hours

Keeping statistics of user commits 
The collaborator of the repo will see the total good and bad commits made and also the number of broken commits made today.



Fig 12: Collaborators repo health report
The manager will get stats of all the collaborators in repo and total commits made by them along with total good and bad commits made on repo. 



Fig 13: Managers repo health report












## Reflection on the development process


The process of developing the PulseBot was one of the most engaging experiences that the team had. Right from phase one of formalising the problem statement to the last stage of successfully deploying the bot, there was a very steep learning curve that pushed all the team members to outperform themselves.

Following are some of the most important reflections/learnings for the team on the development process:

+ Moving from Ambiguity to Specificity in the Problem Statement for the Bot
When the team decided to build a slackbot that would prevent the master branch of a repo from being affected by buggy commits and at the same time maintain statistics about the repo health, there was ambiguity  about the potential scope of the project. This ambiguity helped us brainstorm and come up with significantly useful use cases for this bot. These use cases covered the most of the functionalities we envisioned our bot to carry out and therefore were able to move from the ambiguity in our problem statement to specificity.


+ Task Tracking played an important role in helping the team meet deadlines

While task tracking seemed to be a trivial task, it turned out to be one of the most helpful component in the development process. Before the team deep dived into coding for each milestone, a list of priority based tasks was made along with due dates. This list would then be continually tracked by all team members so that the team would be on the same page. However, we still ended up missing out on a few important tasks which were added later to the task tracker. This is something we could improve on further by having deeper brainstorming sessions before getting into code-mode.



+ Teamwork and troubleshooting to solve bugs 

Last Minute changes to the tasks we assigned ourselves in each milestone led to some tense moments before each submission. There were unforeseen problems that occurred and the team had to really push themselves to the limit in order to troubleshoot these bugs. Since most of us were working with new technologies for the first time, it used to take a while to figure out the solution. However every team member helped anyone in trouble thus enabling us to collectively reach our ultimate goal.
## Limitations

The use cases we chose for our bot covered a major chunk of the functionalities we would ideally want it to have. However there were also a few limitations that came along with them:

+ Reliance on Jenkins to send data

PulseBot heavily relies on Jenkins to get data about the repo such as the number and type (good/buggy) of commits made by collaborators on the repo. In case Jenkins is down, this would cause a lag in our bot and at times even deliver results based on a previous state of the bot. Thus, the users may not be able to instantly fetch data from the bot causing them some inconvenience.


+ Fixed interaction with Bot

The bot currently only responds to a fixed set of commands that it is programmed to function with. This can at times making it frustrating for the user when he/she is unable to extract replies from the bot related to some query that the bot is not able to answer.


## Future Work
Having spoken about few limitations, we see immense scope for PulseBot to become an extremely useful resource in the industry. Following is the future work that can be carried out on the bot:


+ Pre-Configured Jenkins Jobs

The bot can be used to work with already configured Jenkins jobs.


+ Other Repositories
PulseBot can work for multiple repositories at the same time instead of working on just one repo.


+ Added Flexibility

The number of buggy commits a user is allowed to make before he/she is blocked, is restricted to 5. This number could be changed on the discretion of the admin of the repository. Also, each time a user is nearing his/her limit of maximum buggy commits for the day, a notification can be sent so that the user is more careful throughout the day.
