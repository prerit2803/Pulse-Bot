# Deployment

Steps to setup ssh-forwarding:  
To clone a repository from github.ncsu.edu, additional configuration needs to be done to allow cloning of the repository on the server without credentials:

(we will be referring to the ansible server as **ansible machine** and the remote host(where our bot has is to be installed) as **server**)

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


Command to run the ansible playbook: 
```
ansible-playbook main.yml -i inventory --ask-vault-pass
```
**password for ansible-vault**: pulseBot123

# Acceptance Testing

## Credentials

### Slack details
We have created two slack accounts on our team, and a channel for TAs to test.  
+ **Slack team:** pulsebot-project.slack.com
+ **Channel:** testing
+ **Username-1**: pulsebot.test@gmail.com,\t **Password:** pulsebot#12
+ **Username-2:** pulsebot.test2@gmail.com,\t **Password:** pulsebot#12

Once you log into the slack team, commence testing(details for which follow shortly), on the #testing channel.

### Github details
We have been added both TAs as collaborators to our test repository. Login using your respective unity-id and password to the following repository.
+ **Repository:** (MavenVoid)[https://github.ncsu.edu/pulseBotProject/MavenVoid]
+ **User-1:** mbehroo
+ **User-2:** ntabass

## Instructions: Use Case 1
## Instructions: Use Case 2
## Instructions: Use Case 3
