const express = require('express');
const multer = require('multer');
const router = express.Router();
const sql = require('../db.js');
const SQL = require('../service/sql.js');
const authorization = require('../service/authorization');
const uuidv4 = require('uuid/v4');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const logger = require('../config/winston')

const sqlStatement = new SQL();

let s3 = new aws.S3();

aws.config.update({region: 'us-east-1'});

const bucket = process.env.S3_BUCKET_ADDR;
let upload;

if (process.env.NODE_ENV == 'production') {
    upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: bucket,
            acl: 'private',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req, file, cb) => {
                cb(null, file.originalname);
            }
        }),
        fileFilter: function (req, file, cb) {
            if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')
                return cb(null, true);
            else
                return cb(new Error('Unsupported File Format'), false);
        }
    });
} else {
    let storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/images');
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });
    upload = multer({
        storage: storage, fileFilter: function (req, file, cb) {
            if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')
                return cb(null, true);
            else
                return cb(new Error('Unsupported File Format'), false);
        }
    })
}

router.post('/', authorization.checkAccess, function (req, res, next) {
    logger.info("Book Register Call");
    let id = uuidv4();
    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    let quantity = req.body.quantity;

    if (title != null && author != null && isbn != null && quantity >= 1) {
        sql.query(sqlStatement.getAddBookSQL(id, title, author, isbn, quantity), function (err, result, fields) {
            if (err)
                res.status(500).json({
                    message: "SQL error"
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
            message: "Bad Request : Please enter all details"
        });
    }
});

router.get('/:id', authorization.checkAccess, function (req, res, next) {
    logger.info("Book GET by ID Call");
    let id = req.params.id;
    if (id == null) {
        res.status(400).json({
            message: 'Missing Parameters. Bad Request'
        });
    } else {
        sql.query(sqlStatement.getBookById(id), function (err, result) {
            if (result[0] == null) {
                res.status(404).json({
                    message: 'No book found with given id'
                })
            } else {
                let params = {
                    Bucket: bucket,
                    Expires: 120, //seconds
                    Key: result[0].image_url
                };
                var result_modify = [];
                if (process.env.NODE_ENV == 'production') {
                    s3.getSignedUrl('getObject', params, (err, data) => {
                        res.status(200).json({
                            id: result[0].id,
                            title: result[0].title,
                            author: result[0].author,
                            isbn: result[0].isbn,
                            quantity: result[0].quantity,
                            image: {
                                id: result[0].image_id,
                                url: result[0].image_url
                            },
                            presignedURL: data
                        });
                    });
                } else {
                    result.forEach(function (eachBook) {
                        result_modify.push({
                            id: eachBook.id,
                            title: eachBook.title,
                            author: eachBook.author,
                            isbn: eachBook.isbn,
                            quantity: eachBook.quantity,
                            image: {
                                id: eachBook.image_id,
                                url: eachBook.image_url
                            }
                        });
                    });
                    res.status(200).json(result_modify);
                }
            }
        });
    }
});

router.delete('/:id', authorization.checkAccess, function (req, res, next) {
    logger.info("Book Delete Call");
    let id = req.params.id;
    if (id == null) {
        res.status(400).json({
            message: 'Missing Parameters. Bad Request'
        });
    } else {
        sql.query(sqlStatement.deleteBookById(id), function (err, result) {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    message: 'No book found with given id'
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
    logger.info("Book GET All Call");
    sql.query(sqlStatement.getAllBookSQL(), function (err, result, fields) {
        if (err) res.status(500).json({
            message: "SQL error",
            error: err
        });
        else {
            if (result[0] == null)
                res.status(204).json(result);
            else {
                if (process.env.NODE_ENV == 'production') {
                    function loop() {
                        return new Promise((resolve, reject) => {
                            result.forEach((eachBook, index, array) => {
                                let params = {Bucket: bucket, Expires: 120, Key: eachBook.image_url};
                                if (params.Key != null) {
                                    s3.getSignedUrl('getObject', params, (err, data) => {
                                        if (err)
                                            reject(err);
                                        else {
                                            array[index] = {
                                                id: eachBook.id,
                                                title: eachBook.title,
                                                author: eachBook.author,
                                                isbn: eachBook.isbn,
                                                quantity: eachBook.quantity,
                                                image: {
                                                    id: eachBook.image_id,
                                                    url: eachBook.image_url
                                                },
                                                presignedUrl: data
                                            }
                                            resolve(array);
                                        }
                                    })
                                } else{
                                    array[index] = {
                                        id: eachBook.id,
                                        title: eachBook.title,
                                        author:eachBook.author,
                                        isbn: eachBook.isbn,
                                        quantity: eachBook.quantity,
                                        image: {
                                            id: eachBook.image_id,
                                            url: eachBook.image_url
                                        }
                                    }
                                    resolve(array);
                                }

                            });
                        })
                    }

                    loop()
                        .then((array) => {
                            res.status(200).json(array);
                        })
                        .catch((err) => {
                            res.status(500).json(err)
                        });
                } else {
                    res.status(200).json(result);
                }

            }
        }
    })
});

router.put('/', authorization.checkAccess, function (req, res, next) {
    logger.info("Book PUT Call");
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
                if (result.changedRows !== 0) {
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
});


router.post('/:id/image', authorization.checkAccess, upload.single('file'), function (req, res, next) {
    logger.info("Book image POST Call");
    let id = uuidv4();
    let bookid = req.params.id;
    if (req.file.contentType == 'image/jpeg' || req.file.contentType == 'image/png' || req.file.contentType == 'image/jpg' || req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/jpg' || req.file.mimetype == 'image/png') {
        if (!req.file) {
            res.status(400).json({
                message: 'Missing Parameters. Bad Request'
            });
        }
        let url = req.file.originalname;
        if (bookid == null) {
            res.status(400).json({
                message: 'Missing Parameters. Bad Request'
            });
        } else {
            sql.query(sqlStatement.getBookById(bookid), function (err, result) {
                if (result[0] == null) {
                    res.status(404).json({
                        message: 'No book found with given id'
                    })
                } else {
                    if (url != null) {
                        sql.query(sqlStatement.getAddImageSQL(id, url), function (err, result, fields) {
                                if (err)
                                    res.status(500).json({
                                        message: "SQL error"
                                    });
                                else {
                                    sql.query(sqlStatement.getAddBookImageSQL(bookid, id), function (err, result, fields) {
                                        if (err)
                                            res.status(500).json({
                                                message: "SQL error"
                                            });
                                        else {
                                            if (process.env.NODE_ENV == 'production') {
                                                let params = {
                                                    Bucket: bucket,
                                                    Expires: 120, //seconds
                                                    Key: url
                                                };
                                                s3.getSignedUrl('getObject', params, (err, data) => {
                                                    console.log(data);
                                                    res.status(201).json({id: id, PresignedUrl: data});
                                                });
                                            } else {
                                                res.status(201).json({
                                                    id: id,
                                                    url: url
                                                });
                                            }
                                        }
                                    });
                                }

                            }
                        )
                    } else {
                        res.status(400).json({
                            message: "Bad Request : Please enter all details"
                        });
                    }

                }
            });
        }
    } else {
        res.status(400).json({
            message: "Bad Request : Image type have to be PNG, JPEG or JPG"
        });
    }
});


router.get('/:bookid/image/:imageid', authorization.checkAccess, function (req, res, next) {
    logger.info("Book image GET of ID Call");
    let bookid = req.params.bookid;
    let imageid = req.params.imageid;
    if (bookid == null || imageid == null) {
        res.status(400).json({
            message: 'Missing Parameters. Bad Request'
        });
    } else {
        sql.query(sqlStatement.getBookById(bookid), function (err, result) {
            if (result[0] == null) {
                res.status(404).json({
                    message: 'No book found with given id'
                })
            } else {
                if (result[0].image_id == imageid) {
                    sql.query(sqlStatement.getBookImageSQLById(imageid), function (err, result, fields) {
                        if (err) res.status(500).json({
                            message: "SQL error",
                            error: err
                        });
                        else {
                            if (result[0] == null)
                                res.status(204).json(result);
                            else {
                                let params = {
                                    Bucket: bucket,
                                    Expires: 120, //seconds
                                    Key: result[0].url
                                };
                                if (process.env.NODE_ENV == 'production') {
                                    s3.getSignedUrl('getObject', params, (err, data) => {
                                        console.log(data);
                                        res.status(200).json({Result: result[0], PresignedUrl: data});
                                    });
                                } else {
                                    res.status(200).json({Result: result[0]});
                                }

                            }
                        }
                    })
                } else {
                    res.status(400).json({
                        message: 'Image id for given book id is not matching'
                    })
                }
            }
        });
    }
});


router.put('/:bookid/image/:imageid', authorization.checkAccess, upload.single('file'), function (req, res, next) {
    logger.info("Book image PUT of ID Call");
    let bookid = req.params.bookid;
    let imageid = req.params.imageid;
    if (req.file.contentType == 'image/jpeg' || req.file.contentType == 'image/png' || req.file.contentType == 'image/jpg' || req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/jpg' || req.file.mimetype == 'image/png') {
        if (!req.file) {
            res.status(400).json({
                message: 'Missing Parameters. Bad Request'
            });
        }
        let url = req.file.originalname;
        if (bookid == null) {
            res.status(400).json({
                message: 'Missing Parameters. Bad Request'
            });
        } else {
            sql.query(sqlStatement.getBookById(bookid), function (err, result) {
                if (result[0] == null) {
                    res.status(404).json({
                        message: 'No book found with given id'
                    })
                } else {
                    if (result[0].image_id == imageid) {
                        if (url != null) {
                            sql.query(sqlStatement.getBookImageSQLById(imageid), function (err, result, fields) {
                                if (err) res.status(500).json({
                                    message: "SQL error",
                                    error: err
                                });
                                else {
                                    if (result[0] == null)
                                        res.status(404).json({
                                            message: 'No image found with given id'
                                        })
                                    else {
                                        if (process.env.NODE_ENV == 'production') {
                                            let params = {
                                                Bucket: bucket,
                                                Key: result[0].url
                                            };
                                            s3.putObject(params, function (err, data) {
                                                if (err) res.status(500).json({
                                                    message: "S3 error",
                                                    error: err
                                                });
                                                else {
                                                    sql.query(sqlStatement.getUpdateImage(imageid, url), function (err, result, fields) {
                                                        if (err) res.status(500).json({
                                                            message: "S3 updated, but error in Image table",
                                                            error: err
                                                        });
                                                        else {
                                                            res.status(204).json(result);
                                                        }
                                                    })
                                                }
                                            });
                                        } else {
                                            sql.query(sqlStatement.getUpdateImage(imageid, url), function (err, result, fields) {
                                                if (err) res.status(500).json({
                                                    message: "SQL error",
                                                    error: err
                                                });
                                                else {
                                                    res.status(204).json(result);
                                                }
                                            })
                                        }
                                    }
                                }
                            })

                        } else {
                            res.status(400).json({
                                message: "Bad Request : Please enter all details"
                            });
                        }

                    } else {
                        res.status(400).json({
                            message: 'Image id for given book id is not matching'
                        })
                    }

                }
            });
        }
    } else {
        res.status(400).json({
            message: "Bad Request : Image type have to be PNG, JPEG or JPG"
        });
    }
});


router.delete('/:bookid/image/:imageid', authorization.checkAccess, function (req, res, next) {
    logger.info("Book image DELETE of ID Call");
    let imageid = req.params.imageid;
    let bookid = req.params.bookid;
    if (bookid == null) {
        res.status(400).json({
            message: 'Missing Parameters. Bad Request'
        });
    } else {
        sql.query(sqlStatement.getBookById(bookid), function (err, result) {
            if (result[0] == null) {
                res.status(404).json({
                    message: 'No book found with given id'
                })
            } else {
                if (result[0].image_id == imageid) {
                    sql.query(sqlStatement.getBookImageSQLById(imageid), function (err, result, fields) {
                        if (err) res.status(500).json({
                            message: "SQL error",
                            error: err
                        });
                        else {
                            if (result[0] == null)
                                res.status(404).json({
                                    message: 'No image found with given id'
                                });
                            else {
                                if (process.env.NODE_ENV == 'production') {
                                    let params = {
                                        Bucket: bucket,
                                        Key: result[0].url
                                    };
                                    s3.deleteObject(params, function (err, data) {
                                        if (err) res.status(500).json({
                                            message: "S3 error",
                                            error: err
                                        });
                                        else {
                                            sql.query(sqlStatement.deleteImageById(imageid), [imageid], function (err, result) {
                                                if (err) res.status(500).json({
                                                    message: "Delete form S3, SQL error in Image table",
                                                    error: err
                                                });
                                                else {
                                                    res.status(204).json(result);
                                                }
                                            })
                                        }
                                    });
                                } else {
                                    sql.query(sqlStatement.deleteImageById(imageid), [imageid], function (err, result) {
                                        if (err) res.status(500).json({
                                            message: "SQL error",
                                            error: err
                                        });
                                        else {
                                            res.status(204).json(result);
                                        }
                                    })
                                }
                            }
                        }
                    })
                } else {
                    res.status(400).json({
                        message: 'Image id for given book id is not matching'
                    })
                }
            }
        });
    }
});


module.exports = router;