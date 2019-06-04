const bcrypt = require('bcrypt');
const sql = require('../db.js');
const SQL = require('./sql.js')

const sqlStatement = new SQL();

let checkAccess = (req, res, next) =>{
    let auth = req.headers['authorization'];
    if(!auth) {
        res.status(400).json({ "message": "Please login"});
    }else if(auth) {
        let tmp = auth.split(' ');
        let buf = new Buffer(tmp[1], 'base64');
        let plain_auth = buf.toString();
        let creds = plain_auth.split(':');
        let username = creds[0];
        let password = creds[1];
        sql.query(sqlStatement.getUserByEmail(username),function (err,result,fields) {
            if(result[0] == null){
                return res.status(401).json({
                    message: 'Unauthorized : Invalid Username'
                })
            }else{
                if(bcrypt.compareSync(password, result[0].password)){
                    next();
                }else {
                    return res.status(401).json({
                        message: 'Unauthorized : Invalid Password'
                    });
                }
            }
        });
    }
}

module.exports = {
    checkAccess: checkAccess
};