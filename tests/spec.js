require('dotenv').config();
const stat = require('../server/stat');
const fs = require('fs');
const fse = require('fs-extra');

const STORAGE_FOLDER = process.env.STORAGE_FOLDER;
const MOCKS_DIR = process.env.MOCKS_DIR;

/**
 * Import tests
 */

require('./api/actions/get.spec')
require('./api/actions/post.spec')
require('./api/actions/delete.spec')

before(() => {
    console.log('Setup testing environment.');
    if (!stat.isDirectorySync(STORAGE_FOLDER)) {
        console.log('Creating uploads dir');
        fs.mkdirSync(STORAGE_FOLDER);
    }

    // move mock files to testing env.
    fse.copySync(MOCKS_DIR, `${STORAGE_FOLDER}/mocks`);
    console.log('done with testing setup.');
});

after(() => {
    console.log('Teardown of testing environment');
    // remove mock files from testing env.
    fse.removeSync(`${STORAGE_FOLDER}/italy`);
    fse.removeSync(`${STORAGE_FOLDER}/mocks`);
});
