const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('../db.js');
const SQL = require('../service/sql.js')
const Validator = require('../service/validator');
const authorization = require('../service/authorization');
const logger = require('../config/winston')

const sqlStatement = new SQL();
const validator = new Validator();


router.get('/', authorization.checkAccess, function (req,res,next){
  logger.info("User GET Call");
  res.status(200).json({
    "message":"Hello... Today's date is : "+new Date()
  });
});


router.post('/users/register',function(req, res, next) {
  logger.info("User Register Call");
  let username = req.body.username;
  let password = req.body.password;
  if(username !=null && password !=null){
    if(validator.validateEmail(username)){
      if(validator.validatePassword(password)){
        sql.query(sqlStatement.getUserByEmail(username),function(err,result,fields){
          if (err){
            logger.error(err);
            throw err;
            res.status(200).json(result);
          }
          else{
            if(result[0] == null) {
              sql.query(sqlStatement.getAddUserSQL(username, password), function (err, result, fields) {
                if (err) {
                  logger.error(err);
                  throw err;
                }
                res.status(201).json({
                  "message" : "Account Created Successfully"
                });
              });

            }else{
              res.status(409).json({
                "message": "User name already exists"
              })
            }
          }
        })}else{
        res.status(400).json({
          "message": "Password is not strong enough"
        })
      }
    } else{
      res.status(400).json({
        "message": "Invalid Email Id"
      })
    }}else{
    res.status(422).json({
      message:"Please enter all details"
    })
  }
});

module.exports = router;