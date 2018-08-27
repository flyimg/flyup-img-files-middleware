const request = require('supertest');
const app = require('../server/app');
const expect = require('chai').expect;
const stat = require('../server/stat');
const fs = require('fs');
const fse = require('fs-extra');

const UPLOADS_URL = './uploads';
const MOCKS_DIR = './tests/mocks';

/**
 * Import tests
 */

require('./api/actions/get.spec')
require('./api/actions/post.spec')

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

after(() => {
    console.log('Teardown of testing environment');
    // remove mock files from testing env.
    fse.removeSync(`${UPLOADS_URL}/italy`);
    fse.removeSync(`${UPLOADS_URL}/mocks`);
});
