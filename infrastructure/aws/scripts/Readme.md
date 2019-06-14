## Instructions to run script

* Clone repository
* Check if Jq is installed or not, Run command "`which Jq`"
* If Jq is not installed, install it using command "`sudo apt-get install jq`"
* Now navigate to script folder using command "`cd infrastructure/aws/scripts/`"
* To setup network infrastructure run shell script  "`./csye6225-aws-networking-setup.sh 'VPC-CIDR' 'AVAILABILITY_REGION' 'SUBNET1_CIDR' 'SUBNET2_CIDR' 'SUBNET3_CIDR'`"
* Example to create network infrastructure `"./csye6225-aws-networking-setup.sh 10.0.0.1/16 us-east-1 10.0.1.0/24 10.0.2.0/24 10.0.3.0/24"`
* To Teardown network infrastructure run shell script "`./csye6225-aws-networking-teardown.sh 'VPC_ID'`"
* Example Teardown network infrastructure `"./csye6225-aws-networking-teardown.sh vpc-0e4b3a3191dc77894"`