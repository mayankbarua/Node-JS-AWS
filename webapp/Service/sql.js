const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

class SQL {

    getAddUserSQL(username,password) {
        let hash = bcrypt.hashSync(password, 10)
        let sql = `INSERT INTO user(username, password) VALUES('${username}','${hash}')`;
        return sql;
    }

    getAllUserSQL() {
        let sql = `SELECT * FROM user`;
        return sql;
    }

    getUserByEmail(username){
        let sql = `SELECT * FROM user where username='${username}'`;
        return sql;
    }

    getAddBookSQL(title,author,isbn,quantity){
        let sql = `INSERT INTO book(id,title,author,isbn,quantity) VALUES('${uuidv4()}','${title}','${author}','${isbn}','${quantity}')`;
        return sql;
    }
}

module.exports = SQL;
