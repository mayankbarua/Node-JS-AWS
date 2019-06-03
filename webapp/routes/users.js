const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('../db.js');
const SQL = require('../Service/sql.js')
const Validator = require('../Service/validator');
const authorization = require('../Service/authorization');

const sqlStatement = new SQL();
const validator = new Validator();


router.get('/', authorization.checkAccess, function (req,res,next){
  console.log("From GET");
  res.status(200).json({
    "message":"Success"
  });
});


router.post('/users/register',function(req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  if(validator.validateEmail(username)){
    if(validator.validatePassword(password)){
      sql.query(sqlStatement.getUserByEmail(username),function(err,result,fields){
        if (err){
          throw err;
          res.status(200).json(result);
        }
        else{
          if(result[0] == null) {

            sql.query(sqlStatement.getAddUserSQL(username, password), function (err, result, fields) {
              if (err) throw err;
              res.status(200).json({
                "status":"200",
                "messgae" : "Account Created Successfully"
              });
            });

          }else{
            res.status(409).json({
              "status": 409, "error": "User name already exists"
            })
          }
        }
      })}else{
      res.status(409).json({
        "status": 409, "error": "Password is not strong enough"
      })
    }
  } else{
    res.status(403).json({
      "status": 409, "error": "Invalid Email Id"
    })
  }
});

module.exports = router;