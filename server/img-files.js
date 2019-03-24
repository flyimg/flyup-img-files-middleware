const express = require('express');
const fs = require('fs');
const path = require('path');

const imgRouter = express.Router();

const STORAGE_FOLDER = process.env.STORAGE_FOLDER;

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

module.exports = imgRouter;
