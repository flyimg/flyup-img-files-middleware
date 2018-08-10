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

// TODO: setup tests on filesystem to not depend on having files, also add cleanup later.
describe('GET api/media', () => {
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
                    'type',
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
                console.log('List response', res.body);
                if (err) return done(err);
                expect(res.body)
                    .to.be.an('array')
                    .to.have.lengthOf(7); // update this when files or folders are added to the mosks folder
                expect(
                    // here we check for the list to have images
                    res.body.filter(item => item.type.substr(0, 6) === 'image/')
                ).to.have.lengthOf(5);
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
});

after(() => {
    console.log('Teardown of testing environment');
    // remove mock files from testing env.
    fse.removeSync(`${UPLOADS_URL}/mocks`);
});
