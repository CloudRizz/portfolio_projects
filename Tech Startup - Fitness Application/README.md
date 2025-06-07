# Project Breakdown 
![image](https://github.com/user-attachments/assets/3e81170e-d925-4532-adea-3011decfae59)

I was approached by a startup company which is a fast growing tech startup that recently launched their first product, a fitness tracking application.

I was super excited about this project as this gave me the ability to showcase my skills. Initially they set up their infrastructure very quickly to meet launch deadlines and had only been running for a short time. The product was live in the market and they had some reservations over the infrastructure and the current security posture, so they asked me to take a look. I was informed that all 10 employees were sharing the same credentials, which immediately highlighted a significant gap in the company’s security posture. However, the CTO was already aware of the potential risks this posed. As if shared credentials weren’t bad enough — it turned out they were using the AWS root account! I definitely had my work cut out for me.

I began by outlining the key aspects of the current setup, including the existing infrastructure, team structure and access requirements.

Current Setup

- Everyone using the root account credentials
- No distinct permissions in place for different teams
- No MFA or Password policies in place
- AWS Credentials shared via team chats

Current Infrastructure

- EC2 instances running the application
- S3 buckets storing the user data and application assets
- RDS database storing user information
- CloudWatch in place for monitoring
- Several development and production environments

Team Structure & Access Needs

![image](https://github.com/user-attachments/assets/3586024a-f36f-422f-9216-b1f0339c0a60)

Current Architecture Diagram

![image](https://github.com/user-attachments/assets/d138dd58-cec6-4a1e-8db7-c0109f9e67f3)

The current architecture was currently posing multiple risks. We could see only one availability zone was set up to receive all traffic. The private subnet housed the instances and databases. Default security groups were in place meaning no restrictions to traffic and no active presence of the thought of failover.

I got to work on the fundamentals and revised the infrastructure to include multi AZ deployment, private subnets for the RDS database and instances offering an enhanced security posture, refined security groups and an additional application load balancer to support failover and high availability.

Revised Architecture Diagram

![image](https://github.com/user-attachments/assets/1db9d746-7de6-4cef-bfb5-3962c13cd2ce)

Now that I know what the infrastructure is going to look like, the first thing I did was eliminate the use of the root account. I went into IAM and secured the root account with MFA to ensure that even if someone were to obtain the new root password, they wouldn’t be able to access the account without the multi-factor authentication device. There were no root access keys in place that needed rotating or permanent deletion.

![image](https://github.com/user-attachments/assets/996e7156-f80a-4628-8ff3-954452d7f68c)

Then it was time to create a user account that we could use after we signed out of the root account. I navigated over to IAM > Users > Create User and created my admin account.

![image](https://github.com/user-attachments/assets/416861d5-ebc2-4319-98c5-463121ac56f5)

Adding the permissions below to ensure I had full administrator access to the AWS console and its services. You can do this whilst creating the user account, by clicking attach policies directly and searching for the policies below.

![image](https://github.com/user-attachments/assets/e67b9900-f67e-41fd-b93c-b4d9f3475ec1)

Right, time to sign out of the root account and log into the admin account.

A reminder for all: please ensure you secure your root account credentials. These credentials grant unrestricted access to everything on AWS. If they fall into the wrong hands, it could lead to a critical security breach. An attacker could take over the entire account, delete or steal data, or even incur massive costs by spinning up resources for crypto mining (also known as cryptojacking).

It’s essential to store root credentials securely and ensure they are accessible only to individuals who are both authorized and authenticated. Failure to do so could result in significant damage to the business’s brand and potential legal consequences, especially if customer data is exposed.

After logging into the admin account, I took a moment to review the existing CloudWatch logs for any signs of malicious activity. Everything looked clean.

The next step was to create 10 users, each with permissions tailored to their job roles. Each user should follow a strong password policy, including password rotation every 60 days and multi-factor authentication (MFA).

Following the principle of least privilege, we granted users only the permissions necessary for their tasks. This approach improves operational stability and reduces security risks in the event of a compromised account. An additional benefit of tightly scoped permissions is easier monitoring and more effective auditing.

To protect client privacy, I’ve included example screenshots of what I created, rather than actual client data. This allows me to demonstrate my work without compromising the client’s brand or reputation.

To begin, I navigated over to IAM > Users > Create User.

![image](https://github.com/user-attachments/assets/1e331bd3-f086-40bf-9e89-32305d11cab9)

To start off we would choose a user name, ideally following a consistent naming convention for auditing purposes e.g. John Smith could be named John_Dev, indicating that he is in a developer role and would require developer permissions.

![image](https://github.com/user-attachments/assets/85033778-3517-47ed-9bc1-7896fee565e0)

Then we would go ahead and assign permissions to the user. I have gone ahead and created a developer group in advance to show that we can attach the permissions using a user group as we go through the process of creating a user. I have already assigned permissions for the developer group and show how I achieved this later on in the blog. So here we would attach the user to a group, however we can attach policies directly if it was an individual user, such as we did with our admin user to provide administrative access. Click Next.

![image](https://github.com/user-attachments/assets/7f66dc33-8ec9-4135-9c62-4cee361f6f56)

Now we can review our details before we create our user. I would suggest creating Tags for users specific to their job role, as this helps with auditing. e.g. Using a tag called Developer, would help search or audit all users with the tag developer in future. Click, create user.

![image](https://github.com/user-attachments/assets/9ac098d0-818a-46ab-8eba-ae0bb12df5e4)

I repeated the process above 10 times to create 10 separate users. As you can see from above the user was created successfully.

![image](https://github.com/user-attachments/assets/5802d90b-2934-4209-860b-2340fed314ce)

At this point I wanted to ensure the password policies were in place so I navigated to account Settings, to amend the password policy. Click edit in top right hand corner.

![image](https://github.com/user-attachments/assets/41baecec-6061-4d42-ba01-072b6ae1d537)

IAM has default password policies in place but I wanted to refine these to ensure a greater security posture. So the above password policy was set with 8 characters minimum, password expiration every 60 days, preventing the same password being reused twice over a period of 2 password changes and allowing users to change their own password. This tightens the security posture by ensuring credentials are rotated.

Now we have 10 users, next is to create user groups with refined permissions which allow the user to do the function of their job role. I navigated over to user groups and clicked create group.

![image](https://github.com/user-attachments/assets/aabd2dce-c917-47a0-a4be-cc55da822f16)

Ensure to choose a group name which is relevant, I decided to keep this very simple by using the names of the job roles e.g. operations, developers, finance and analysts. You can also create a group and add the users whilst creating the group as you can see from above.

![image](https://github.com/user-attachments/assets/27e7c439-0bcd-4ead-ac1a-ab4b55e44ae6)

Now we refine the permissions required for the specific job role, keeping in mind the best practice of least privilege.

In this case, Developers needed full access to EC2, S3, and CloudWatch. To assign these permissions, we searched for the relevant policy names. If there was any uncertainty about what a policy allowed, the description on the right-hand side provided helpful clarification.

After identifying the necessary policies, I created the user group by scrolling to the bottom of the page and clicking “Create user group.”

![image](https://github.com/user-attachments/assets/5e0d85ee-1dd9-4751-9972-a410662dec9d)

You can then review the permissions by clicking the developer group and navigating to the permissions tab. If you need to add more permissions this can be done from this page also. I repeated this, to create the 4 groups needed with the relevant permissions.

![image](https://github.com/user-attachments/assets/55a60450-aabf-446e-b454-f4095b3009b1)

Operations needed access to full access to EC2, CloudWatch, Systems Manager, and RDS. Finance needs full cost management access, this can be achieved by clicking filter by type, selecting AWS managed — job function and then selecting the Billing option. AWS has predetermined policies for specific job functions, and in this case the permissions the billing option provides is perfect for the finance manager.

![image](https://github.com/user-attachments/assets/055df371-9433-4571-9f3b-44a4e387805b)

All the permissions needed were pre specified in the project requirements and questioned as to whether or not the particular individuals needed that access. Again we only want to provide access they need to minimize any mishaps.

![image](https://github.com/user-attachments/assets/0fc74b66-81d4-4198-81c2-7dcf6084a587)

The analysts only required read only access for S3 and RDS. You can see at this point I had the groups designed and the users created. I then followed up by attaching the relevant users to the relevant groups to ensure the right access. The password policy was in place for all users and all users were advised to set up MFA and this was monitored until all users had this in place.

In the interest of security, we will now refine the security groups to ensure fine-grained control over the traffic access to different parts of our infrastructure.

As a revision of the architecture, we will use AZ 1 as our main infrastructure and have AZ 2 on standby for high availability. If AZ 1 goes down or becomes unavailable, AZ 2 will take on the traffic. Additionally, if AZ 1 experiences a high spike in traffic, AZ 2 can assist to prevent overload or downtime. This failover process is controlled by the application load balancer. An added benefit is that the application load balancer continuously monitors the health of our target servers and instances, meaning it only routes traffic to healthy resources.

Our public subnet allows traffic from the internet, as it serves as the front end of the architecture. This enabled all internet traffic via HTTP and HTTPS to pass through the NACL and enter the public subnet. The load balancer had tightly refined control via its security group to direct the appropriate traffic toward the EC2 instances in the private subnet. The security group at the instance level was configured to allow HTTP and HTTPS traffic, as well as SSH access from a bastion host or my IP address, ensuring a controlled point of access. The instances could communicate with the database servers over the local network using private IPs. The RDS security groups were set up to allow traffic only from the EC2 security group to keep data secure and restrict access to only what is required. We also had a NAT gateway in the public subnet to allow the private instances to connect to the internet for outbound requests such as software patching or updates.

Essentially, when a user goes for a run and activates the fitness app, the traffic flows through the public subnet to the application load balancer, which then routes it to the instances running the application server. When the user finishes the run or retrieves current or historical fitness data, the application communicates with the S3 bucket / database to store or retrieve the relevant data.

This project was an incredible opportunity to apply best practices in cloud security and infrastructure design while helping a fast-growing startup strengthen their operational foundation. By implementing IAM best practices, enforcing the principle of least privilege, introducing high availability through multi-AZ architecture, and tightening security controls across the environment, we significantly reduced risk and increased resilience. It was rewarding to see the transformation not just in the technical setup, but in the team’s awareness of secure cloud operations. I’m proud of the outcome and excited to see how the product continues to grow on a much more secure and scalable foundation.

A faster approach through Infrastructure as Code:

AWSTemplateFormatVersion: '2010-09-09'
Description: 'IAM Cloudformation template'


# Adding a group
Resources:  
  DevelopersGroup:
    Type: 'AWS::IAM::Group'
    Properties:
      GroupName: 'Developers'
      ManagedPolicyArns:
        - 'arn:aws:iam::aws:policy/AmazonEC2FullAccess'  
        - 'arn:aws:iam::aws:policy/AmazonS3FullAccess'
        - 'arn:aws:iam::aws:policy/CloudWatchEventsFullAccess'

  FinanceGroup:
    Type: 'AWS::IAM::Group'
    Properties:
      GroupName: 'Finance'
      ManagedPolicyArns:
        - 'arn:aws:iam::aws:policy/job-function/Billing'

# Adding a IAM User
 
  DeveloperUser:
    Type: 'AWS::IAM::User'
    Properties:
      UserName: John_Dev

  FinanceUser:
    Type: 'AWS::IAM::User'
    Properties:
      UserName: Mike_Finance

# Attach User to the Group 
      
  UserToDeveloper:
    Type: 'AWS::IAM::UserToGroupAddition'
    Properties: 
      GroupName: !Ref DevelopersGroup
      Users: 
        - !Ref DeveloperUser
  
  UserToFinance:
    Type: 'AWS::IAM::UserToGroupAddition'
    Properties: 
      GroupName: !Ref FinanceGroup
      Users: 
        - !Ref FinanceUser

Through infrastructure as code we could have made the users a lot faster and made it reusable and scalable for future demand. The code above allows us to add multiple users and automatically add them to different groups with different permissions. Which would take a fraction of the time and make it reusable for adding more users in the future. ⚡⚡⚡
