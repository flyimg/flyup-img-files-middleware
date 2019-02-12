/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;
const mime = require('mime');

/**
 * Util function we will reuse to check if the caught error is simply a "not found" error
 *
 * @param {*} err
 * @returns {boolean}
 */
function isErrorNotFound(err) {
    return err.code === 'ENOENT';
}

/**
 * The good old synchronous check to see if a path results in a folder.
 *
 * @param {string} filePath
 * @returns {boolean}
 */
function isDirectory_sync(filePath) {
    try {
        const stat = fs.statSync(filePath);
        return stat.isDirectory();
    } catch (err) {
        // if it's simply a not found error
        if (isErrorNotFound(err)) {
            return false;
        }
        // othewise throw the error
        throw err;
    }
}

/**
 * Async + callback version of the check to see if a path resolves to a folder
 *
 * @param {string} filePath : does this resolve to a dir?
 * @param {Function} callback : this callback gets called with the result (bool)
 */
function isDirectory_callback(filePath, callback) {
    fs.stat(filePath, (err, stat) => {
        if (err) {
            const errorToReturn = isErrorNotFound(err) ? undefined : err;
            callback(errorToReturn, false);
            return;
        }
        callback(undefined, stat.isDirectory());
    });
}

/**
 * Promise based async check if a path resolves to a dir
 *
 * @param {string} filePath
 * @returns {Promise}
 */
function isDirectory_promise(filePath) {
    return fsPromises
        .stat(filePath)
        .then(fsStat => fsStat.isDirectory())
        .catch(err => {
            if (isErrorNotFound(err)) {
                return false;
            }
            throw err;
        });
}

/**
 * Async awaited version of the check if a path resolves to a dir
 *
 * @param {string} filePath
 * @returns {Promise}
 */
async function isDirectory_asyncAwait(filePath) {
    // the result can be either false (from the caught error) or it can be an fs.stats object
    const result = await fsPromises.stat(filePath).catch(err => {
        if (isErrorNotFound(err)) {
            return false;
        }
        throw err;
    });

    return !result ? result : result.isDirectory();
}

/**
 * Mime related methods
 */

/**
 * Get mime and extension for the filetype of a path.
 *
 * @param {string} filePath
 * @returns {object} {mimetype: string, extension: string}
 */
function getMimeTypeAndExtension(filePath) {
    let type = mime.getType(filePath);
    if (type === null) {
        // if not recognized and not a directory, we treat it as txt/plain
        // @todo: try to recognize with the file buffer.
        type = isDirectory_sync(filePath) ? 'DIRECTORY' : 'text/plain';
    }
    let extension = mime.getExtension(type);
    extension = extension === 'jpeg' ? 'jpg' : extension;
    return {
        mimetype: type,
        extension,
    };
}

/**
 * Returns an object with a bit more info than what stat does, including filename, size, extension and mimetype
 * @param {string} filePath
 */
function fileInfo(filePath) {
    const fileStat = fs.statSync(filePath);
    return {
        mtime: fileStat.mtime,
        name: path.basename(filePath),
        size: fileStat.size,
        ...getMimeTypeAndExtension(filePath),
    };
}

/**
 * For now we export only the sync and async await implementation
 */
module.exports = {
    isDirectory: isDirectory_asyncAwait,
    isDirectorySync: isDirectory_sync,
    getMimeTypeAndExtension,
    fileInfo,
};
