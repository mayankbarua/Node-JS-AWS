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
        if (err) res.status(500).json({
            message:"SQL error",
            error: err
        });
        else {
            if (result[0] == null)
                res.status(204).json(result);
            else
                res.status(200).json(result);
        }
    })

})

router.put('/',authorization.checkAccess ,function(req, res, next) {
    let bookID = req.body.id;
    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    let quantity = req.body.quantity;
    if (bookID != null && title != null && author != null && isbn != null && quantity >= 0) {
        sql.query(sqlStatement.getupdateBookSQL(bookID, title, author, isbn, quantity), function (err, result, fields) {
            if (err) {
                res.status(500).json({
                    message: "SQL error"
                });
            }else {
                if(result.changedRows!=0){
                    res.status(204).json({
                        message:"Updated Successfully",
                        data: result
                    });
                }else{
                    res.status(400).json({
                        message:"No content available for entered book id"
                    });
                }

            }
        })
    }
    else{
        res.status(400).json({
            message: "Bad Request: Please enter all details"
        })
    }

})

module.exports = router;