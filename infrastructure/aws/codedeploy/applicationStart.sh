#!/bin/bash

cd ~
FILE=checkFile.sh
while ! test -f "$FILE"; do
    sleep 30s
    echo "$FILE not exist"
done

cd home/centos/webapp
pwd
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/cloudwatch-agent-config.json -s
runuser -l centos -c 'pm2 start ~/webapp/ecosystem.config.js --env production'
runuser -l centos -c 'pm2 list'
