const fs = require("fs");
const fsPromises = require("fs").promises;

function isErrorNotFound(err) {
    return err.code === "ENOENT";
}

function isFolderSync(path) {
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

function isFolder(path, callback) {
    fs.stat(path, (err, stat) => {
        if (err) {
            const errorToReturn = isErrorNotFound(err) ? undefined : err;
            callback(errorToReturn, false);
            return;
        }
        callback(undefined, stat.isDirectory());
    });
}

const pathsToTest = [
    "uploads/memes",
    "nopes/memes",
    "uploads/memes/not-folder",
];

function checkPathsSync(method) {
    console.log(...pathsToTest.map(path => method(path)));
}

function checkPaths(method) {
    pathsToTest.forEach(path =>
        method(path, (err, result) => console.log(err ? err : result))
    );
}
checkPathsSync(isFolderSync);
console.log("----- async --------");
checkPaths(isFolder);
console.log("----- promised -----");
