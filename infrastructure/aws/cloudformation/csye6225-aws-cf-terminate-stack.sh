#! /bin/bash
#Terminating cloudformation stack

STACK_NAME=$1

if [ -z "$1" ]
then
    echo "Enter Stack name to be deleted"
    exit 1
else
    echo -e "Deletion started\n"
    aws cloudformation delete-stack --stack-name $STACK_NAME

    aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME

    if [ $? -eq 0 ]; then
        echo "Terminated Successfully"
    else
        echo "Termination unsuccessful"
    fi
fi