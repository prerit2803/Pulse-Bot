# PulseBot
Software Engineering Fall 2017 Project

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
