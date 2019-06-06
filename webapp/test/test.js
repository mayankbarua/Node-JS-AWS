let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);
describe("Login", () => {
    describe('/GET Login', () => {
        it('it should validate user if correct return current date', (done) => {
            chai.request(server)
                .get('/')
                .set("Authorization", "basic " + new Buffer("mayank@gmail.com:Mayank@1234").toString("base64"))
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('it should validate user if non correct return unauthorized', (done) => {
            chai.request(server)
                .get('/')
                .set("Authorization", "basic " + new Buffer("mayank@gmail.com:Mayank@123").toString("base64"))
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});

