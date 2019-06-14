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

    getAddBookSQL(id,title,author,isbn,quantity){
        let sql = `INSERT INTO book(id,title,author,isbn,quantity) VALUES('${id}','${title}','${author}','${isbn}','${quantity}')`;
        return sql;
    }

    getBookById(id){
        let sql = `select b.id, b.title, b.author, b.isbn, b.quantity, i.id as image_id, i.url as image_url from book b left join image i on b.image = i.id  where b.id='${id}'`;
        //let sql = `SELECT * FROM book where id='${id}'`;
        return sql;
    }

    deleteBookById(id){
        let sql = `DELETE FROM book where id='${id}'`;
        return sql;
    }

    getAllBookSQL(){
        let sql = `select b.id, b.title, b.author, b.isbn, b.quantity, i.id as image_id, i.url as image_url from book b left join image i on b.image = i.id`;
        //let sql =  `SELECT * FROM book`;
        return sql;
    }

    getupdateBookSQL(bookID, title,author,isbn,quantity){
        let sql = `UPDATE book SET  title = '${title}', author = '${author}', isbn = '${isbn}', quantity = '${quantity}' where id='${bookID}'`;
        return sql;
    }

    getAddImageSQL(id,url){
        let sql = `INSERT INTO image(id,url) VALUES('${id}','${url}')`;
        return sql;
    }

    getAddBookImageSQL(bookid, id){
        let sql = `UPDATE book SET  image = '${id}' where id='${bookid}'`;
        return sql;
    }


    getBookImageSQLById(id){
        let sql = `SELECT * FROM image where id='${id}'`;
        return sql;
    }


    getUpdateImage(imageid, url){
        let sql = `UPDATE image SET  url = '${url}' where id='${imageid}'`;
        return sql;
    }


    deleteImageById(imageid){
        let sql = `DELETE FROM image where id='${imageid}'`;
        return sql;
    }

    deleteImageFromBook(bookid){
        let sql = `UPDATE image SET url = null where id='${bookid}'`;
        return sql;
    }

}




module.exports = SQL;
