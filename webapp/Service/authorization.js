const bcrypt = require('bcrypt');
const sql = require('../db.js');
const SQL = require('./sql.js')

const sqlStatement = new SQL();

let checkAccess = (req, res, next) =>{
    let auth = req.headers['authorization'];
    if(!auth) {
        res.status(400).json({"status": 200, "error": "Please login"});
    }else if(auth) {
        let tmp = auth.split(' ');
        let buf = new Buffer(tmp[1], 'base64');
        let plain_auth = buf.toString();
        let creds = plain_auth.split(':');
        let username = creds[0];
        let password = creds[1];
        sql.query(sqlStatement.getUserByEmail(username),function (err,result,fields) {
            if(result[0] == null){
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                })
            }else{
                if(bcrypt.compareSync(password, result[0].password)){
                    console.log("From True")
                    next();
                }else {
                    return res.json({
                        success: false,
                        message: 'Unauthorized'
                    });
                }
            }
        });
    }
}

module.exports = {
    checkAccess: checkAccess
};