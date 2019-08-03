#!/usr/bin/env bash
#Creating cloudformation application stack

STACK_NAME=$1
AMI_ID=$2
NETWORKING_STACK_NAME=$3
CODEDEPLOY_S3=$4
IMAGE_S3=$5
DOMAIN=$6



if [[ -z "$1" || -z "$2" || -z "$3" || -z "$4" || -z "$5" || -z "$6" ]]
then
	echo "Please enter all parameters in order ( Stack Name, AMI id, Networking Stack Name, CodeDeploy S3 Bucket, Image store s3 Bucket )"
	exit 1
else
	aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://csye6225-cf-application.json --parameters ParameterKey=AMIid,ParameterValue=$AMI_ID ParameterKey=NetworkStackName,ParameterValue=$NETWORKING_STACK_NAME ParameterKey=CodeDeployS3Bucket,ParameterValue=$CODEDEPLOY_S3 ParameterKey=ImageS3Bucket,ParameterValue=$IMAGE_S3 ParameterKey=DomainName,ParameterValue=$DOMAIN --capabilities CAPABILITY_NAMED_IAM
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
