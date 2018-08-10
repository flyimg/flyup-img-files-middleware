const request = require('supertest');
const app = require('../server/app');
const expect = require('chai').expect;
const stat = require('../server/stat');
const fs = require('fs');
const fse = require('fs-extra');

const UPLOADS_URL = './uploads';
const MOCKS_DIR = './tests/mocks';
describe(' ', () => {
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
    it('should return a folder`s content listed', done => {
        request(app)
            .get('/api/media/')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                console.log('getting response');
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                done();
            });
    });
});

describe('Teardown of testing environment', () => {
    // remove mock files from testing env.
    fse.removeSync(`${UPLOADS_URL}/mocks`);
    it('done teardown', done => {
        done();
    });
});
