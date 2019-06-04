const express = require('express');
const router = express.Router();
const sql = require('../db.js');
const SQL = require('../Service/sql.js')
const authorization = require('../Service/authorization');

const sqlStatement = new SQL();

router.post('/', authorization.checkAccess, function (req, res, next) {
    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    let quantity = req.body.quantity;
    sql.query(sqlStatement.getAddBookSQL(title, author, isbn, quantity), function (err, result, fields) {
        if (err) throw err;
        res.status(201).json(result);
    });
});

router.get('/:id', authorization.checkAccess, function (req, res, next) {
    let id = req.params.id;
    if (id == null) {
        res.status(400).json({
            Message: 'Missing Parameters. Bad Request'
        });
    } else {
        sql.query(sqlStatement.getBookById(id), function (err, result) {
            if (result[0] == null) {
                res.status(404).json({
                    Message: 'No book found with given id'
                })
            } else {
                res.status(200).json(result[0]);
            }
        });
    }
});

router.delete('/:id', authorization.checkAccess, function (req, res, next) {
    let id = req.params.id;
    if (id == null){
        res.status(400).json({
            Message: 'Missing Parameters. Bad Request'
        });
    } else{
        sql.query(sqlStatement.deleteBookById(id), function (err, result) {
            if(result.affectedRows == 0) {
                res.status(404).json({
                    Message: 'No book found with given id'
                })
            } else{
                res.status(204).json({
                    message: 'Book Deleted'
                });
            }
        })
    }

});

module.exports = router;