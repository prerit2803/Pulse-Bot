# CSC510-Project
Software Engineering Fall 2017 Project
## Problem Statement
Git has implemented multiple functions that can track and update repositories. However, currently no functionality exists that can not only detect and flag broken code commits but also prevent particular user from continuously making such commits. If this particular user responsible for the the successive bad commits is not denied access, it may lead to a cascading effect on the rest of the repository and affect working of other users.

Thus, the problem we aim to address here is that of recording the activity of inefficient commits of codes as well as the developer responsible for it. This also gives us an opportunity to identify and maintain the ‘health’ of the repository. The erring developer would be temporarily denied access to the repository if he/she makes consecutive bad commits to the repository.As mentioned above, a repo having a branch with bad commits is not healthy for the application, therefore maintaining a summary of the commits would be a helpful functionality which has not yet been implemented on Github.

