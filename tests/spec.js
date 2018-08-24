const request = require('supertest');
const app = require('../server/app');
const expect = require('chai').expect;
const stat = require('../server/stat');
const fs = require('fs');
const fse = require('fs-extra');

const UPLOADS_URL = './uploads';
const MOCKS_DIR = './tests/mocks';

before(() => {
    console.log('Setup testing environment.');
    if (!stat.isDirectorySync(UPLOADS_URL)) {
        console.log('Creating uploads dir');
        fs.mkdirSync(UPLOADS_URL);
    }

    // move mock files to testing env.
    fse.copySync(MOCKS_DIR, `${UPLOADS_URL}/mocks`);
    console.log('done with testing setup.');
});

describe('GET api/media + sub folders and sub files', () => {
    it('should return the root folder´s content listed, with the mocks directory at least.', done => {
        request(app)
            .get('/api/media/')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array').that.is.not.empty;
                expect(res.body.find(item => item.name === 'mocks')).to.have.property(
                    'mimetype',
                    'DIRECTORY'
                );
                done();
            });
    });

    it('should list the images inside the "mocks" folder', done => {
        request(app)
            .get('/api/media/mocks/')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                // console.log('List response', res.body);
                if (err) return done(err);
                expect(res.body)
                    .to.be.an('array')
                    .to.have.lengthOf(8); // update this when files or folders are added to the mosks folder
                expect(
                    // here we check for the list to have images
                    res.body.filter(item => item.mimetype.substr(0, 6) === 'image/')
                ).to.have.lengthOf(6);
                done();
            });
    });

    it('should return an empty array when there are no images in the dir.', done => {
        request(app)
            .get('/api/media/mocks/empty/')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body)
                    .to.be.an('array')
                    .to.have.lengthOf(0);
                done();
            });
    });

    it('should return the contents of sub folders.', done => {
        request(app)
            .get('/api/media/mocks/venice/')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body)
                    .to.be.an('array')
                    .to.have.lengthOf(2); // this must be updated in the case of adding files to venice folder
                done();
            });
    });

    it('should return the contents of sub folders, even if the trailing slash is missing.', done => {
        request(app)
            .get('/api/media/mocks')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array').to.be.not.empty;
                done();
            });
    });

    it('should return the contents of the root folder, even if the trailing slash is missing.', done => {
        request(app)
            .get('/api/media')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array').to.be.not.empty;
                done();
            });
    });

    it('should return 404, with empty body, when the requested path is not found', done => {
        request(app)
            .get('/api/media/inexistent')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.equal('');
                done();
            });
    });

    it('should return 404, with empty body, when the requested path is not an allowed filetype', done => {
        request(app)
            .get('/api/media/mocks/not-an-image-file.js')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.equal('');
                done();
            });
    });

    it('should return the file info when the requested resource is an image', done => {
        request(app)
            .get('/api/media/mocks/castle_small.jpg')
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

describe('POST /api/media', () => {
    it('should create a new folder "italy" in the root folder. And respond with an object with the name', done => {
        request(app)
            .post('/api/media')
            .send({
                name: 'italy'
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
                    .to.equal('italy')
                done();
            })
    });

    it('should fail with a 400 and a message when POST data is missing "name" attribute.', done => {
        request(app)
            .post('/api/media')
            .send({
                wrong_name: 'italy'
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(400)
            .end((err, res) => {
                console.log('res 400:', res.body);
                if (err) return done(err);
                expect(res.body).to.be.an('object')
                expect(res.body.message)
                    .to.be.a('string')
                    .to.have.lengthOf.above(5)
                done();
            })
    });

    it(`should fail to create a new sub folder "france/marseille" in the root folder
    (since the folder france has not been created).
    And respond with bad request 400, since you can't create sub-folders directly.`, done => {
        request(app)
            .post('/api/media')
            .send({
                name: 'france/marseille'
            })
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('object')
                    .to.be.not.empty
                    .to.haveOwnProperty('message')
                    .to.be.length.greaterThan(5);
                done();
            })
    });

    it('should respond with 404, with empty body, when the requested path is not found', done => {
        request(app)
            .post('/api/media/france')
            .send({
                name: 'marseille'
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

    });

    it(`should fail to create a new sub folder "milan/brera" in the "italy" sub-folder
    (since the folder france has not been created).
    And respond with not allowed (401?)`, done => {

    });
});

after(() => {
    console.log('Teardown of testing environment');
    // remove mock files from testing env.
    fse.removeSync(`${UPLOADS_URL}/italy`);
    fse.removeSync(`${UPLOADS_URL}/mocks`);
});
