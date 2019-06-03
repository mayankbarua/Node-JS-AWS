const express = require('express');
const router = express.Router();
const sql = require('../db.js');
const SQL = require('../Service/sql.js')
const authorization = require('../Service/authorization');

const sqlStatement = new SQL();

router.post('/',authorization.checkAccess ,function(req, res, next) {
    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    let quantity = req.body.quantity;
    sql.query(sqlStatement.getAddBookSQL(title,author,isbn,quantity), function (err, result, fields) {
        if (err) throw err;
        res.status(201).json(result);
    });
});

router.get('/', authorization.checkAccess, function (req,res, next) {
    sql.query(sqlStatement.getAllBookSQL(), function (err, result, fields) {
        if (err) throw err;
        res.status(200).json(result);
    })

})

router.put('/:bookID',authorization.checkAccess ,function(req, res, next) {
    let bookID = req.params.bookID;
    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    let quantity = req.body.quantity;
    sql.query(sqlStatement.getupdateBookSQL(bookID,title,author,isbn,quantity), function (err, result, fields) {
        if (err) throw err;
        res.status(200).json(result);
    })

})

module.exports = router;