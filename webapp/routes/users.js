const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('../db.js');
const SQL = require('../service/sql.js')
const Validator = require('../service/validator');
const authorization = require('../service/authorization');
const logger = require('../config/winston')
const SDC = require('statsd-client'), sdc = new SDC({host: 'localhost', port: 8125});


const sqlStatement = new SQL();
const validator = new Validator();

const aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});
const uuidv4 = require('uuid/v4');
var sns = new aws.SNS({});
var s3 = new aws.S3();

router.get('/', authorization.checkAccess, function (req, res, next) {
    logger.info("User GET Call");
    sdc.increment('GET User (time)');
    res.status(200).json({
        "message": "Hello... Today's date is : " + new Date()
    });
});


router.post('/users/register', function (req, res, next) {
    logger.info("User Register Call");
    sdc.increment('POST user');
    let username = req.body.username;
    let password = req.body.password;
    if (username != null && password != null) {
        if (validator.validateEmail(username)) {
            if (validator.validatePassword(password)) {
                sql.query(sqlStatement.getUserByEmail(username), function (err, result, fields) {
                    if (err) {
                        logger.error(err);
                        throw err;
                        res.status(200).json(result);
                    } else {
                        if (result[0] == null) {
                            sql.query(sqlStatement.getAddUserSQL(username, password), function (err, result, fields) {
                                if (err) {
                                    logger.error(err);
                                    throw err;
                                }
                                res.status(201).json({
                                    "message": "Account Created Successfully"
                                });
                            });

                        } else {
                            res.status(409).json({
                                "message": "User name already exists"
                            })
                        }
                    }
                })
            } else {
                res.status(400).json({
                    "message": "Password is not strong enough"
                })
            }
        } else {
            res.status(400).json({
                "message": "Invalid Email Id"
            })
        }
    } else {
        res.status(422).json({
            message: "Please enter all details"
        })
    }
});


router.post('/reset/:email', function (req, res, next) {
    logger.info("Reset Password");
    sdc.increment('Reset Password');
    let email = req.params.email;
    sql.query(sqlStatement.getUserByEmail(email), function (err, result) {
        if (err) {
            logger.error(err);
            throw err;
        } else {
            if (result[0] == null) {
                res.status(400).json({
                    "message": "No EmailID found in database"
                });
            } else {
                let topicParams = {Name: 'EmailTopic'};
                sns.createTopic(topicParams, (err, data) => {
                    if (err) console.log(err);
                    else {
                        let resetLink = 'http://'+process.env.DOMAIN_NAME+'?email=' + email + '&token=' + uuidv4();
                        let payload = {
                            default: 'Hello World',
                            data: {
                                Email: email,
                                link: resetLink
                            }
                        };
                        payload.data = JSON.stringify(payload.data);
                        payload = JSON.stringify(payload);

                        let params = {Message: payload, TopicArn: data.TopicArn}
                        sns.publish(params, (err, data) => {
                            if (err) console.log(err)
                            else {
                                console.log('published')
                                res.status(201).json({
                                    "message": "Reset password link sent on email Successfully!"
                                });
                            }
                        })
                    }
                })

            }
        }

    });
});

module.exports = router;