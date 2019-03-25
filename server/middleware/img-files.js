const express = require('express');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const urlParse = require('url').parse;
const glob = require('glob');

const upHandler = require('./multer-configuration');
const mimetypes = require('./file-handling/mimetypes');
const stats = require('./file-handling/stat');

const imgRouter = express.Router();

const STORAGE_FOLDER = process.env.STORAGE_FOLDER;

const contentTypes = {
    appJson: 'application/json',
    multipart: 'multipart/form-data;',
};

imgRouter.all('*', (req, res, next) => {
    console.log('hello from router', req.path);
    // get the relative path, remove the prefix
    let maskedPath = req.path.substr(1);

    // this normalizes the trailing slash on root.
    maskedPath = maskedPath === '/' ? '' : maskedPath;

    // path of the resource in the file system
    req.fsPath = path.join(STORAGE_FOLDER, maskedPath);
    req.maskedPath = maskedPath;

    // if no file and no dir exist, return 404
    if (!fs.existsSync(req.fsPath)) {
        return res.status(404).json();
    }

    return next();
});

imgRouter.post('*', upHandler.single('uploaded_file'), (req, res, next) => {
    // If this is just regular json skip this and go on to the next middleware
    if (req.headers['content-type'] === contentTypes.appJson) {
        return next();
    }

    // if there is no file posted or it's not allowed, reject.
    if (!req.file || !mimetypes.getExtensionFromAcceptedMimeType(req.file.mimetype)) {
        return res.status(422).json({
            error: 422,
            message: 'ERROR: The uploaded file must be an image',
        });
    }
    return res.status(201).json({});
});

imgRouter.get('*', (req, res, next) => {
    const fsPath = req.fsPath;
    // if it is not a dir, get the file data
    if (!stats.isDirectorySync(fsPath)) {
        if (mimetypes.isListableFileType(fsPath)) {
            res.status(200).json(stats.fileInfo(fsPath));
        } else {
            res.status(404).json();
        }
        return;
    }

    // if it is a dir
    let maskedPath = req.maskedPath;
    // add trailing slash if missing
    maskedPath = !maskedPath || maskedPath.substr(-1) === '/' ? maskedPath : maskedPath + '/';

    glob(
        maskedPath + '*',
        {
            cwd: STORAGE_FOLDER,
        },
        (err, files) => {
            if (err) {
                next(err);
            }
            res.status(200).json(
                files
                    .map(file => {
                        const relativeStoragePath = path.join(STORAGE_FOLDER, file);
                        return stats.fileInfo(relativeStoragePath);
                    })
                    .filter(file => mimetypes.isListableMimeType(file.mimetype))
            );
        }
    );
});

imgRouter.post('*', (req, res) => {
    // if it is a dir
    let maskedPath = req.maskedPath;
    // add trailing slash if missing
    maskedPath = !maskedPath || maskedPath.substr(-1) === '/' ? maskedPath : maskedPath + '/';

    // if there is no name property: fail
    if (!req.body.name) {
        res.status(400).json({
            error: 400,
            message: 'ERROR: missing "name" attribute in the post data.',
        });
        return;
    }

    const newFolderName = urlParse(req.body.name).pathname;

    // we only allow the creation of one folder, not nested ones.
    if (newFolderName.indexOf('/') > -1) {
        res.status(400).json({
            error: 400,
            message: `ERROR: invalid foldername:
            ${newFolderName}`,
        });
        return;
    }

    const newFolderPath = path.join(STORAGE_FOLDER, maskedPath, newFolderName);

    // existing folders can't be created again
    if (stats.isDirectorySync(newFolderPath)) {
        res.status(409).json({
            error: 409,
            message: `ERROR: The "${newFolderName}" folder already exists`,
        });
        return;
    }

    // if all goes well we create the folder
    // TODO: change for async solution, and catch any errors.
    fs.mkdirSync(newFolderPath);

    res.status(201).json({
        name: newFolderName,
    });
});

imgRouter.delete('*', (req, res) => {
    const maskedPath = req.maskedPath;

    // if the path is the media root, it should not be allowed to delete
    if (!maskedPath) {
        res.status(405).json({
            error: 405,
            message: 'Method (DELETE) not alowed for this route.',
        });
        return;
    }

    const fsPath = req.fsPath;
    // if it is not a dir, check the filetype is listable (and deletable)
    if (!stats.isDirectorySync(fsPath)) {
        // this is a file
        if (mimetypes.isListableFileType(fsPath)) {
            fse.removeSync(fsPath);
            res.status(200).json({
                name: maskedPath,
            });
        } else {
            // then this is not a file suposed to be seen
            res.status(404).json();
        }
    } else {
        // this is a folder
        fse.removeSync(fsPath);
        res.status(200).json({
            name: maskedPath,
        });
    }
});

module.exports = imgRouter;
