# Deployment

We will be referring to the master server i.e. the machine from where ansible script will be run as **ansible machine** and the remote host i.e. the machine where our bot has to be installed as **server**.

The deployment of bot includes the following steps:
+ Setting up the ansible machine
+ Enabling ssh-forwarding on ansible machine
+ Deployment on server

## Setting up the ansible machine
* Clone the [repo](https://github.ncsu.edu/sshah11/CSC510-Project/tree/Milestone4) into the ansible machine.
```
git clone https://github.ncsu.edu/sshah11/CSC510-Project.git -b Milestone4
```

* Install ansible on the ansible machine
```
sudo apt-add-repository ppa:ansible/ansible
sudo apt-get update
sudo apt-get install ansible
```

* Change working directory to `CSC510-Project/ansible`

## Enabling ssh-forwarding on ansible machine
To clone a repository from github.ncsu.edu, additional configuration needs to be done to allow cloning of the repository on the server without credentials:

* create a public-private key pair on the ansible machine using the following commands:
```
ssh-keygen -t rsa
```
* Start an ssh-agent using the following command:
```
eval `ssh-agent`
```
* Add the ssh keys generated in step1 to the agent started in step 2  using the following command:
(replace **private key** in the following command with the actual name of the private key file.)
```
ssh-add ~/.ssh/private_key
```
* Add the public key to the github account of this repository.
* Ensure the ansible machine can ssh into the github.ncsu.edu without credentials using the following command:
```
ssh -T git@github.ncsu.edu
```
* Now we need to enable AgentForwarding on the ansible machine so that the server can also clone the repo without credentials.
To do this create a new file named **config** in the ~/.ssh directory of the ansible machine and place the following contents in it:
```
Host <Your server's IP address>
  ForwardAgent yes
```
* Now ssh into the server from the ansible machine and execute the following command to ensure the server can communicate with github.ncsu.edu without credentials:
```
ssh -T git@github.ncsu.edu
```

## Deployment using ansible

Command to run the ansible playbook: 
```
ansible-playbook main.yml -i inventory --ask-vault-pass
```
**password for ansible-vault**: pulseBot123

# Acceptance Testing

After the deployment, the pulsebot becomes online in the slack group and is ready to rock and roll! Let's see how it can be tested.

## Credentials

### Slack details
We have created two slack accounts on our team, and a channel for TAs to test.  
+ **Slack team:** pulsebot-project.slack.com
+ **Channel:** testing
+ **Username-1**: pulsebot.test@gmail.com,        **Password:** pulsebot#12
+ **Username-2:** pulsebot.test2@gmail.com,        **Password:** pulsebot#12

Once you log into the slack team, commence testing(details for which follow shortly), on the #testing channel.

### Github details
We have added both TAs and Professor Parnin as collaborators to our test repository. Login using your respective unity-id and password to the following repository.
+ **Repository:** [MavenVoid](https://github.ncsu.edu/pulseBotProject/MavenVoid)
+ **User-1:** mbehroo
+ **User-2:** ntabass
+ **User-3:** cjparnin

Next, clone the test repository on ansible machine. This will allow you to commit from git shell/command-line.
```
git clone https://github.ncsu.edu/pulseBotProject/MavenVoid.git
```
Change the working directory in git shell/command-line to `MavenVoid/src/test/java/edu/ncsu/mavenvoid/MavenVoid/`   
We placed two shell scripts `goodCommit.sh` and `badCommit.sh` in this directory to facilitate making a good and bad commits. (You may also choose to edit AppTest.java directly.)  
  
**Committing on repository:** We refer to **good commit** as a commit which passes all the test cases and gets successfully built on the Jenkins server. Similarly **bad commit** is a commit which fails at least one test case and builds unsuccessfully on the Jenkins server.  
Simulating a good/bad commit can be done in two ways:
+ Manually, by editing the AppTest.java and ensuring `assert(true)` for a good commit (`assert(false)` for a bad commit) in the `testApp` method. Followed by a manual commit to the master branch.
+ In an automated way by running commands `./goodCommit.sh` for good commit and `./badCommit.sh` for bad commit. This will only prompt you to enter your git username and passwords.   
_Note: Manually commiting from the Github website will not yield the desired action from pulseBot. Please use only a console to commit._

## Instructions: Use Case 1
**Use Case 1: Create a new branch with healthy code and lock it down until master branch is unstable.**  
* The bot needs one initial healthy commit to refer as stable branch. Make one good commit and ensure it reflects on the github website.
* Once this is done, on every commit if a build on master branch fails, the pulseBot creates a new protected branch with the last stable commit as its HEAD. When the master branch becomes stable again, bot deletes the branch that was created in previous step.  
**Example:** If, after the initial (first) commit, the second commit fails the build then pulseBot creates a protected stable branch (named stablebranch, followed by a number) with it's HEAD at the last stable commit(the first commit in this case). If the third commit on master branch is good then the protected branch is deleted since master is now stable. If the third commit on the master branch is bad then the stable branch remains since master branch is not stable yet.
* Use slack to ask the bot about the current stable branch every time a commit is made on the master branch, it will respond with the stable branch name.

## Instructions: Use Case 2
**Use Case 2: Tentative blocking of a buggy code committer**  

* As you go on commiting to the master branch, pulseBot keeps track of the status of build resulting from your commits and classifies every commit as a good or a bad commit. We have set a **Threshold=5** to denote the maximum number of bad commits a user can do in a day. After 4 bad commits, pulseBot sends warning to the user and removes him after crossing 5.
* To test this, make one user to do 5 bad commit to the master branch within the time frame of 00:01am to 11:59pm. After every commit ask on slack the number of bad commits left for the day. It will show you the number of bad commits remaining for that user. Once the user reaches the threshold, the next bad commit by that user will remove him temporarily as the collaborator of the repository. That user won't be able to commit any further on the repository until midnight.      
**Example:** If, asaxena3 makes 4 bad commits to the repository, he will get a warning from pulseBot. After 5th commit, his count reaches 0 and he will get another warning. asaxena3 has done all his bad commits for the day. If he makes one more bad commit, he is removed from the collaborator list.    
_Note: We added both mbehroo and ntabass as contributors with write permissions so, they can't see the list of contributors. Hence we added cjparnin as admin so that you can check this(since it is on github.ncsu.edu, we couldn't create a dummy user as an admin for you.). Also, another important thing is that an owner of organization can always make commits to a repository. So asaxena3 and sshah11(org owner) can make commits even if they are removed from repository._
* You can ask for 'grant me repo access' on slack to pulseBot. If user is a member and has not crossed his threshold then pulseBot responds similarly. Otherwise, if user is temporarily removed as a collaborator then pulseBot responds with the time after which you can be added by pulseBot as a repository collaborator. Once that time is past, ask pulseBot on slack to grant acces to repo and it adds the user back as the repo collaborator.

## Instructions: Use Case 3
**Use Case 3: Create a report with a summary of number of commits per user and their segregation into broken or stable.**
* Every user can see it's own commit history divided in terms of good and bad commits. Ask the pulseBot on slack "What is the repo health ?" to which a user can see a pie chart of repo's total commits classified into good and bad commits. Second graph it can see is how far it is from the threshold value. PulseBot also provides the stable branch name to the user.
* If the user is admin, then commits of all collaborators of the repo will be displayed in a Bar graph, repo's good and bad commits will be displayed in a Pie graph and pulseBot provides a stable branch name and a list of users who have been temporarily blocked (removed as collaborator) along with their next access time.

# Task-Tracking

We used Trello for task tracking. A weekly itinerary of tasks performed can be found in the [worksheet.md.](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone4/WORKSHEET.md) 
Use the following credentials to log in to Trello:  
+ **username:** Pulsebotproject@gmail.com
+ **password:** pulsebot@project

# Screencast
[Screencast: Deployment + Use cases](https://youtu.be/7JLPPXTrp4c)
