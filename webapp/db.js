const mysql = require("mysql");
require('dotenv').config();
let connection;

if (process.env.NODE_ENV === 'production') {
    console.log("ENV Production: " + process.env.NODE_ENV);
    connection = mysql.createConnection({
        host: process.env.RDS_HOSTNAME,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        database: 'csye6225'
    });
} else {
    console.log("Default ENV : " + process.env.NODE_ENV);
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });
}

connection.connect(function (err) {
    if (err)
        throw err;
    else {
        connection.query('create table if not exists user(username varchar(200), password varchar(200))', (error, data) => {
            if (error)
                throw error;
            else
                console.log('User table created');
        });
        connection.query('create table if not exists image(id varchar(200), url varchar(200), primary key(id))', (error, data) => {
            if (error)
                throw error;
            else
                console.log('Image table created');
        });
        connection.query('create table if not exists book(id varchar(200), title varchar(200), author varchar(200), isbn varchar(200), quantity int(11), image varchar(200), foreign key(image) REFERENCES image(id))', (error, data) => {
            if (error)
                throw error;
            else
                console.log('Book table created');
        });
        console.log("Connected");
    }
});

module.exports = connection;