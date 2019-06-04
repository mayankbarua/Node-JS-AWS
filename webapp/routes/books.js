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
    if(title != null && author != null && isbn !=null && quantity>=1){
    sql.query(sqlStatement.getAddBookSQL(title,author,isbn,quantity), function (err, result, fields) {
        if (err)
            res.status(500).json({
                messgae:"SQL error"
            });
        else
            res.status(201).json(result);
    });}else{
        res.status(400).json({
            messgae:"Bad Request : Please enter all details"
        });
    }
});

module.exports = router;