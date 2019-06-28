## Instructions to run script

* Clone repository
* Now navigate to script folder using command "cd infrastructure/aws/cloudformation/"
* To setup a cloudformation stack run shell script

     `./csye6225-aws-cf-create-stack.sh 'STACK_NAME' 'VPC-CIDR' 'SUBNET1_CIDR' 'SUBNET2_CIDR' 'SUBNET3_CIDR' 'AVAILABILITY_REGION'`
     `./csye6225-cf-create-application-stack.sh 'Stack Name' 'AMI ID' 'NETWORK STACK NAME'`
* Example to create network infrastructure using cloudformation using the shell script 

    `./csye6225-aws-cf-create-stack.sh test 10.0.0.0/16 10.0.1.0/24 10.0.2.0/24 10.0.3.0/24 us-east-1 `
    `./csye6225-cf-create-application-stack.sh applicationstack ami-086e75324403a7c62 networkstack
`
* To delete a cloudformation stack run shell script 

    `./csye6225-aws-cf-terminate-stack.sh 'STACK_NAME'`
    
* Example delete stack shell script command
 
    `./csye6225-aws-cf-terminate-stack.sh teststack`