# Deployment

We will be referring to the master server i.e. the machine from where ansible script will be run as **ansible machine** and the remote host i.e. the machine where our bot has to be installed as **server**.

The deployment of bot includes the following steps:
+ Setting up the ansible machine.
+ Enabling ssh-forwarding on ansible machine.
+ Deployment on server

## Setting up the ansible machine.
* Clone the (repo)[!https://github.ncsu.edu/sshah11/CSC510-Project/tree/Milestone4] into the ansible machine.
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

* Next, clone the test repository on ansible machine. This will allow you to commit from git shell/command-line.
```
git clone https://github.ncsu.edu/pulseBotProject/MavenVoid.git
```
* Change the working directory in git shell/command-line to `MavenVoid/src/test/java/edu/ncsu/mavenvoid/MavenVoid/`
We placed two shell scripts `goodCommit.sh` and `badCommit.sh` in this directory to facilitate making a good and bad commits. (You may also choose to edit AppTest.java directly.)  
  
**Committing on repository:**
We refer to **good commit** as a commit which passes all the test cases and gets successfully built on the Jenkins server. Similarly a **bad commit** is a commit which fails at least one test case and builds unsuccessfully on the Jenkins server.  
Simulating a good/bad commit can be done in two ways:
+ Manually, by editing the AppTest.java and ensuring `assert(true)` for a good commit (`assert(false)` for a bad commit) in the `testApp` method. Followed by a manual commit to the master branch.
+ In an automatated way by running commands `./goodCommit.sh` for good commit and `./badCommit.sh` for bad commit. This will only prompt you to enter your git username and passwords. 
_Note: Manually commiting from the Github website will not yield the desired reults. Please use only a console to commit._

## Instructions: Use Case 1
**Use Case 1:Create a new branch with healthy code and lock it down until master branch is unstable.***  
* The bot needs one initial healthy commit to refer as stable branch. Make a good commit i.e. a commit that passes the test case in AppTest.java. You can either do it in two ways:
+ Manually, 

## Instructions: Use Case 2

## Instructions: Use Case 3

# Task-Tracking

We used Trello for task tracking. A weekly itinerary of tasks performed can be found in the [worksheet.md.](https://github.ncsu.edu/sshah11/CSC510-Project/blob/Milestone4/WORKSHEET.md) 
Use the following credentials to log in to Trello:  
+ **username:** Pulsebotproject@gmail.com
+ **password:** pulsebot@project

# Screencast
[Screencast: Deployment + Use cases]()
