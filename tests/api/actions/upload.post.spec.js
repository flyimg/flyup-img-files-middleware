const request = require('supertest');
const app = require('../../../server/app');
const expect = require('chai').expect;
// fixtures/Acaena-argenta__small.jpg

describe('UPLOADS to /api/media', () => {
    describe('POST ( UPLOAD ) /api/media', () => {
        it('should be able to upload an image to the root folder via POST. And respond with status 201 and an empty object (for now)', done => {
            request(app)
                .post('/api/media')
                .attach('uploaded_file', 'tests/fixtures/Acaena-argenta__small.jpg')
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect(201)
                .end((err, res) => {
                    console.log('res:', res.body);
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    done();
                });
        });

        it(`should be able to upload another image to the root folder via POST.
    Respond with status 201 and an empty object (for now).
    And be available when requested through GET.`, done => {
            const agent = request(app);
            agent
                .post('/api/media')
                .attach('uploaded_file', 'tests/fixtures/cactus-flower_h300.jpg')
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    agent.get('/api/media/cactus-flower_h300.jpg')
                        .set('Accept', 'application/json')
                        .expect('Content-type', 'application/json; charset=utf-8')
                        .expect(200)
                        .end((err, res) => {
                            if (err) return done(err);
                            expect(res.body).to.be.an('object').to.be.not.empty;
                            done();
                        });
                })
        });
    });
    describe('POST ( UPLOAD ) /api/media/mocks', () => {
        it(`should be able to upload an image to a sub folder via POST.
    Respond with status 201 and an empty object (for now).
    And be available when requested through GET.`, done => {
            const agent = request(app);
            agent
                .post('/api/media/mocks')
                .attach('uploaded_file', 'tests/fixtures/cactus-flower_h300.jpg')
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    agent.get('/api/media/mocks/cactus-flower_h300.jpg')
                        .set('Accept', 'application/json')
                        .expect('Content-type', 'application/json; charset=utf-8')
                        .expect(200)
                        .end((err, res) => {
                            if (err) return done(err);
                            expect(res.body).to.be.an('object').to.be.not.empty;
                            done();
                        });
                })
        });
    });
    /*
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
                        expect(res.body).to.be.an('object').to.not.be.empty;
                        expect(res.body)
                            .to.haveOwnProperty('message')
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
            });*/
});
