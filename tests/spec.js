require('dotenv').config();
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const stat = require('../server/middleware/file-handling/stat');

const STORAGE_FOLDER = process.env.STORAGE_FOLDER;
const MOCKS_DIR = process.env.MOCKS_DIR;

/**
 * Import tests
 */

require('./api/actions/get.spec');
require('./api/actions/post.spec');
require('./api/actions/upload.post.spec');
require('./api/actions/delete.spec');

before(() => {
    console.log('Setup testing environment.');
    if (!stat.isDirectorySync(STORAGE_FOLDER)) {
        console.log('Creating uploads dir: ' + STORAGE_FOLDER);
        fs.mkdirSync(STORAGE_FOLDER);
    }

    // move mock files to testing env.
    fse.copySync(MOCKS_DIR, path.join(STORAGE_FOLDER, 'mocks'));
    console.log('done with testing setup.');
});

after(() => {
    console.log('Teardown of testing environment');
    // remove mock files from testing env.
    fse.removeSync(path.join(STORAGE_FOLDER, 'italy'));
    fse.removeSync(path.join(STORAGE_FOLDER, 'mocks'));
});
