require('dotenv').config()

const request = require('supertest');
const app = require('../../../server/app');
const expect = require('chai').expect;

const fse = require('fs-extra');

const STORAGE_FOLDER = process.env.STORAGE_FOLDER;
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
                    agent
                        .get('/api/media/cactus-flower_h300.jpg')
                        .set('Accept', 'application/json')
                        .expect('Content-type', 'application/json; charset=utf-8')
                        .expect(200)
                        .end((err, res) => {
                            if (err) return done(err);
                            expect(res.body).to.be.an('object').to.be.not.empty;
                            done();
                        });
                });
        });

        it(`should fail with a 409 and a message when trying to upload to a file`, done => {
            const agent = request(app);
            agent
                .post('/api/media/mocks/butterfly_small.png')
                .attach('uploaded_file', 'tests/fixtures/cactus-flower_h300.jpg')
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
                    agent
                        .get('/api/media/mocks/cactus-flower_h300.jpg')
                        .set('Accept', 'application/json')
                        .expect('Content-type', 'application/json; charset=utf-8')
                        .expect(200)
                        .end((err, res) => {
                            if (err) return done(err);
                            expect(res.body).to.be.an('object').to.be.not.empty;
                            done();
                        });
                });
        });

        it('should happily overwrite an image if posted to the same path', done => {
            try {
                // we copy a first image to where the we want to upload the second image, also renaming it to match the second one.
                fse.copyFileSync('tests/fixtures/Acaena-argenta__small.jpg', `${STORAGE_FOLDER}mocks/venice/cactus-flower_h300.jpg`);
            } catch (err) {
                console.error('Mock folder or target folder not found! something is wrong');
                throw err;
            }
            // we store the size of the first image
            const originalFileSize = fse.statSync(`${STORAGE_FOLDER}mocks/venice/cactus-flower_h300.jpg`).size;
            const agent = request(app);
            agent
                .post('/api/media/mocks/venice')
                .attach('uploaded_file', 'tests/fixtures/cactus-flower_h300.jpg')
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    const finalFileSize = fse.statSync(`${STORAGE_FOLDER}mocks/cactus-flower_h300.jpg`).size;
                    expect(originalFileSize).to.be.above(finalFileSize);
                    done();
                });
        });
    });
});
