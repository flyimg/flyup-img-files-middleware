const fs = require("fs");
const fsPromises = require("fs").promises;

/**
 * Util function we will reuse to check if the caught error is simply a "not found" error
 *
 * @param {*} err
 * @returns {boolean}
 */
function isErrorNotFound(err) {
    return err.code === "ENOENT";
}

/**
 * The good old synchronous check to see if a path results in a folder.
 *
 * @param {string} path
 * @returns {boolean}
 */
function isFolder_sync(path) {
    try {
        const stat = fs.statSync(path);
        return stat.isDirectory();
    } catch (err) {
        // if it's simply a not found error
        if (isErrorNotFound(err)) {
            return false;
        }
        //othewise throw the error
        throw err;
    }
}

/**
 * Async + callback version of the check to see if a path resolves to a folder
 *
 * @param {string} path : does this resolve to a dir?
 * @param {Function} callback : this callback gets called with the result (bool)
 */
function isFolder_callback(path, callback) {
    fs.stat(path, (err, stat) => {
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
 * @param {string} path
 * @returns {Promise}
 */
function isFolder_promise(path) {
    return fsPromises
        .stat(path)
        .then(fsStat => {
            return fsStat.isDirectory();
        })
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
 * @param {string} path
 * @returns {Promise}
 */
async function isFolder_asyncAwait(path) {
    // the result can be either false (from the caught error) or it can be an fs.stats object
    const result = await fsPromises.stat(path).catch(err => {
        if (isErrorNotFound(err)) {
            return false;
        }
        throw err;
    });

    return !result ? result : result.isDirectory();
}

/**
 * This array of strings test 3 cases
 * 1. valid directory
 * 2. folder does not exist (fs.stat should throw an error)
 * 3. a file: path resolves to something but it is not a dir
 */
const pathsToTest = [
    "uploads/memes",
    "nopes/memes",
    "uploads/memes/not-folder",
];

/**
 * LOOPERS looping funcions
 *
 * Loop through the pathsToTest and pass it to the method to be tested
 * (each will test the methods slightly differently)
 */

/**
 * Synchronously run through the loop, get the response and print
 *
 * @param {Function} method to test
 */
function checkPathsSync(method) {
    console.log(`${method.name}: `, ...pathsToTest.map(path => method(path)));
}

/**
 * Asynchronously run through the loop,
 * pass the print funtion as a callback
 *
 * @param {Function} method to test
 */
function checkPaths(method) {
    pathsToTest.forEach(path =>
        method(path, (err, result) =>
            console.log(`${method.name}: `, err ? err : result)
        )
    );
}

/**
 * Aynchronously run through the loop,
 * Store all the returned Promises and wait for them to resolve
 * Once all have resolved print the responses along with the method name used to get them.
 *
 * @param {Function} method to test
 */
function checkPromisedPaths(method) {
    Promise.all(pathsToTest.map(path => method(path))).then(values => {
        console.log(`${method.name}: `, values);
    });
}

checkPathsSync(isFolder_sync);
checkPaths(isFolder_callback);
checkPromisedPaths(isFolder_promise);
checkPromisedPaths(isFolder_asyncAwait);
