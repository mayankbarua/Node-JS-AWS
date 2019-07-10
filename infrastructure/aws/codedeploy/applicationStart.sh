#!/bin/bash

cd home/centos/webapp
pwd
runuser -l centos -c 'pm2 start ~/webapp/ecosystem.config.js --env production'
runuser -l centos -c 'pm2 list'
