#! /bin/bash
#Creating cloudformation stack

STACK_NAME=$1
VPC_CIDR=$2
CIDR_SUBNET01=$3
CIDR_SUBNET02=$4
CIDR_SUBNET03=$5
REGION=$6
SUBNET_01=$STACK_NAME-subnet01
SUBNET_02=$STACK_NAME-subnet02
SUBNET_03=$STACK_NAME-subnet03
VPC_NAME=$STACK_NAME-vpc
INTERNETGATEWAY=$STACK_NAME-internetgateway
ROUTETABLE=$STACK_NAME-routetable

if [[ -z "$1" || -z "$2" || -z "$3" || -z "$4" || -z "$5" || -z "$6" ]]
then
	echo "Please enter all parameters in order ( Stack Name, VPC CIDR block, CIDR block for 3 subnets, Region )"
	exit 1
else
	aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://aws-cloudformation-template.json --parameters ParameterKey=VPCName,ParameterValue=$VPC_NAME ParameterKey=VPCCIDR,ParameterValue=$VPC_CIDR ParameterKey=Subnet01CIDR,ParameterValue=$CIDR_SUBNET01 ParameterKey=Subnet02CIDR,ParameterValue=$CIDR_SUBNET02 ParameterKey=Subnet03CIDR,ParameterValue=$CIDR_SUBNET03 ParameterKey=Region,ParameterValue=$REGION ParameterKey=Subnet01Name,ParameterValue=$SUBNET_01 ParameterKey=Subnet02Name,ParameterValue=$SUBNET_02 ParameterKey=Subnet03Name,ParameterValue=$SUBNET_03 ParameterKey=InternetGatewayName,ParameterValue=$INTERNETGATEWAY ParameterKey=RouteTableName,ParameterValue=$ROUTETABLE
    if [ $? -eq 0 ]; then
        aws cloudformation wait stack-create-complete --stack-name $STACK_NAME
        if [ $? -eq 0 ]; then
            echo "Stack created successfully"
        else
            echo "Stack creation unsuccessful"
        fi
    else
        echo "Stack creation unsuccessful"
    fi
fi




