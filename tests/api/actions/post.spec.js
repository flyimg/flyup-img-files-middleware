const request = require('supertest');
const app = require('../../../server/app');
const expect = require('chai').expect;

describe('POST /api/media', () => {
    it('should create a new folder "italy" in the root folder. And respond with an object with the name', done => {
        request(app)
            .post('/api/media')
            .send({
                name: 'italy',
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(201)
            .end((err, res) => {
                console.log('res:', res.body);
                if (err) return done(err);
                expect(res.body).to.be.an('object');
                expect(res.body.name)
                    .to.be.a('string')
                    .to.equal('italy');
                done();
            });
    });

    it('should fail with a 400 and a message when POST data is missing "name" attribute.', done => {
        request(app)
            .post('/api/media')
            .send({
                wrong_name: 'italy',
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(400)
            .end((err, res) => {
                console.log('res 400:', res.body);
                if (err) return done(err);
                expect(res.body).to.be.an('object');
                expect(res.body.message)
                    .to.be.a('string')
                    .to.have.lengthOf.above(5);
                done();
            });
    });

    it('should fail with a 409 and a message when trying to create an existing folder.', done => {
        request(app)
            .post('/api/media')
            .send({
                name: 'italy',
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(409)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('object');
                expect(res.body.message)
                    .to.be.a('string')
                    .to.have.lengthOf.above(5);
                done();
            });
    });

    it(`should fail to create a new sub folder "france/marseille" in the root folder
    (since the folder france has not been created).
    And respond with bad request 400, since you can't create sub-folders directly.`, done => {
        request(app)
            .post('/api/media')
            .send({
                name: 'france/marseille',
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body)
                    .to.be.an('object')
                    .to.not.be.empty;
                expect(res.body).to.haveOwnProperty('message')
                    .to.be.length.greaterThan(5);
                done();
            });
    });

    it('should respond with 404, with empty body, when the requested path is not found', done => {
        request(app)
            .post('/api/media/france')
            .send({
                name: 'marseille',
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.equal('');
                done();
            });
    });
});

describe('POST /api/media/italy', () => {
    it('should create a new folder "verona" in the "italy" sub-folder', done => {
        request(app)
            .post('/api/media/italy')
            .send({
                name: 'verona',
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(201)
            .end((err, res) => {
                console.log('res:', res.body);
                if (err) return done(err);
                expect(res.body).to.be.an('object');
                expect(res.body.name)
                    .to.be.a('string')
                    .to.equal('verona');
                done();
            });
    });

    it(`should fail to create a new sub folder "milan/brera" in the "italy" sub-folder
    (since the sub-folder milan has not been created).
    And respond with bad request 400, since you can't create sub-sub-folders directly.`, done => {
        request(app)
            .post('/api/media/italy')
            .send({
                name: 'milan/brera',
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body)
                    .to.be.an('object')
                    .to.not.be.empty;
                expect(res.body).to.haveOwnProperty('message')
                    .to.be.length.greaterThan(5);
                done();
            });
    });
});
