#!/usr/bin/env bash
STACK_NAME=$1

if [[ -z "$1" ]]
then
	echo "Please enter all parameters in order ( Stack Name )"
	exit 1
else
	aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://csye6225-cf-waf-template.yml
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