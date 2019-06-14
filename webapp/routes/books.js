const express = require('express');
const multer = require('multer');
const router = express.Router();
const sql = require('../db.js');
const SQL = require('../Service/sql.js')
const authorization = require('../Service/authorization');
const uuidv4 = require('uuid/v4');

const sqlStatement = new SQL();

router.post('/', authorization.checkAccess, function (req, res, next) {
    let id = uuidv4();
    console.log(req.body);
    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    let quantity = req.body.quantity;
    if (title != null && author != null && isbn != null && quantity >= 1) {
        sql.query(sqlStatement.getAddBookSQL(id, title, author, isbn, quantity), function (err, result, fields) {
            if (err)
                res.status(500).json({
                    messgae: "SQL error"
                });
            else
                res.status(201).json({
                    id: id,
                    title: title,
                    author: author,
                    isbn: isbn,
                    quantity: quantity
                });
        });
    } else {
        res.status(400).json({
            messgae: "Bad Request : Please enter all details"
        });
    }
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
    if (id == null) {
        res.status(400).json({
            Message: 'Missing Parameters. Bad Request'
        });
    } else {
        sql.query(sqlStatement.deleteBookById(id), function (err, result) {
            if (result.affectedRows == 0) {
                res.status(404).json({
                    Message: 'No book found with given id'
                })
            } else {
                res.status(204).json({
                    message: 'Book Deleted'
                });
            }
        })
    }

});

router.get('/', authorization.checkAccess, function (req, res, next) {
    sql.query(sqlStatement.getAllBookSQL(), function (err, result, fields) {
        if (err) res.status(500).json({
            message: "SQL error",
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

router.put('/', authorization.checkAccess, function (req, res, next) {
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
            } else {
                if (result.changedRows != 0) {
                    res.status(204).json({
                        message: "Updated Successfully",
                        data: result
                    });
                } else {
                    res.status(400).json({
                        message: "No content available for entered book id or No changes"
                    });
                }

            }
        })
    } else {
        res.status(400).json({
            message: "Bad Request: Please enter all details"
        })
    }
})

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        console.log(file);
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});

var upload = multer({storage: storage});


router.post('/:id/image', authorization.checkAccess, upload.single('file'), function (req, res, next) {
    let id = uuidv4();
    let bookid = req.params.id;
    let url = req.file.path;
    console.log(req.file);
    console.log(req.file.filename);
    if (!req.file) {
        res.status(500);
        return next(err);
    }

    if (url != null) {
        sql.query(sqlStatement.getAddImageSQL(id, url), function (err, result, fields) {
                if (err)
                    res.status(500).json({
                        messgae: "SQL error"
                    });
                else {
                    sql.query(sqlStatement.getAddBookImageSQL(bookid, id), function (err, result, fields) {
                        if (err)
                            res.status(500).json({
                                messgae: "SQL error"
                            });
                        else
                            res.status(201).json({
                                id: id,
                                url: url
                            });
                    });
                }

            }
        )
    } else {
        res.status(400).json({
            messgae: "Bad Request : Please enter all details"
        });
    }

})

router.get('/:bookid/image/:imageid', authorization.checkAccess, function (req, res, next) {
    let bookid = req.params.bookid;
    let imageid = req.params.imageid;
    sql.query(sqlStatement.getBookImageSQLById(imageid), function (err, result, fields) {
        if (err) res.status(500).json({
            message: "SQL error",
            error: err
        });
        else {
            if (result[0] == null)
                res.status(204).json(result);
            else
                res.status(200).json(result[0]);
        }
    })
})


router.put('/:bookid/image/:imageid', authorization.checkAccess, upload.single('file'), function (req, res, next) {
    let bookid = req.params.bookid;
    let imageid = req.params.imageid;
    let url = req.file.path;
    sql.query(sqlStatement.getUpdateImage(imageid, url), function (err, result, fields) {
        if (err) res.status(500).json({
            message: "SQL error",
            error: err
        });
        else {
            res.status(204).json(result);
        }
    })

})


router.delete('/:bookid/image/:imageid', authorization.checkAccess, function (req, res, next) {
    let imageid = req.params.imageid;
    let bookid = req.params.bookid;
    console.log(imageid);
    if (imageid == null) {
        res.status(400).json({
            Message: 'Missing Parameters. Bad Request'
        });
    } else {
        sql.query(sqlStatement.deleteImageById(imageid), [imageid], function (err, result) {
            console.log(result);
            res.status(204).json({
                message: 'Book Deleted'
            });
        })
    }
})



module.exports = router;