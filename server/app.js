require('dotenv').config();

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const glob = require('glob');
const fs = require('fs');
const fse = require('fs-extra');
const urlParse = require('url').parse;

const stats = require('./stat');
const mimetypes = require('./mimetypes');

const API_MEDIA_URL = process.env.API_MEDIA_URL;
const STORAGE_FOLDER = process.env.STORAGE_FOLDER;

const contentTypes = {
    appJson: 'application/json',
    multipart: 'multipart/form-data;',
};

const upHandler = multer({
    fileFilter: (req, file, cb) => {
        // @todo: make sure the mimetype is actualy the one advertized by the extension. @see issue #1
        const extension = mimetypes.getExtensionFromAcceptedMimeType(file.mimetype);

        // we store the extension property in the file object
        // eslint-disable-next-line no-param-reassign
        file.extension = extension;

        // for now we just validate if it is one of the expected filetypes.
        const isValidFile = !!extension;

        cb(null, isValidFile);

        // If it's not a valid file, nothing will stop, multer just won't save the file, express will happyly continue it's flow,
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            let error = null;
            // if it is not a dir, it's trying to post to a file... crazy
            if (!stats.isDirectorySync(req.fsPath)) {
                error = {
                    error: 409,
                    message: `ERROR: You can not POST to a file, only a folder.
                    Go home, you crazy.`,
                };
                return req.next(error);
            }
            // gets the calculated final path from the req object (it was calculated earlier)
            cb(error, req.fsPath);
        },
        filename: (req, file, cb) => {
            const extension = file.extension;
            let filename = file.originalname;

            // we chek if the mimetype extension is already part of the filename, if not we append the extension.
            filename += filename.substr(-extension.length) === extension ? '' : '.' + extension;

            // we call the callback with the final filename
            cb(null, filename);
        },
    }),
});

/** configure CORS */
const originsWhitelist = [
    'http://localhost:4200', // this is my front-end url for development
    'http://no.clue.yet',
];
const corsOptions = {
    origin: (origin, callback) => {
        const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true,
};

const app = express();

app.use(morgan(process.env.MORGAN_LOG_TYPE || 'combined'));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(express.static('server/static'));
// TODO: add serve-static middleware to serve the static files ( https://github.com/expressjs/serve-static )

app.all(API_MEDIA_URL + '*', (req, res) => {
    // this is the path without API_MEDIA_URL sufix
    let maskedPath = req.url.substr(API_MEDIA_URL.length + 1);

    // this normalizes the trailing slash on root.
    maskedPath = maskedPath === '/' ? '' : maskedPath;

    // path of the resource in the file system
    req.fsPath = STORAGE_FOLDER + maskedPath;
    req.maskedPath = maskedPath;

    // if no file and no dir exist, return 404
    if (!fs.existsSync(req.fsPath)) {
        return res.status(404).json();
    }

    return req.next();
});

app.post(API_MEDIA_URL + '*', upHandler.single('uploaded_file'), (req, res) => {
    // If this is just regular json skip this and go on to the next middleware
    if (req.headers['content-type'] === contentTypes.appJson) {
        return req.next();
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

app.get(API_MEDIA_URL + '*', (req, res) => {
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
            res.status(200).json(
                files
                    .map((file) => {
                        const relativeStoragePath = STORAGE_FOLDER + file;
                        return stats.fileInfo(relativeStoragePath);
                    })
                    .filter(file => mimetypes.isListableMimeType(file.mimetype))
            );
        }
    );
});

app.post(API_MEDIA_URL + '*', (req, res) => {
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

    const newFolderPath = STORAGE_FOLDER + maskedPath + newFolderName;

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

app.delete(API_MEDIA_URL + '*', (req, res) => {
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

// here we pass unhandled errors (like from multer)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err && err.error) {
        res.status(err.error).json(err);
    }
});

if (!module.parent) {
    app.listen(3000);
}
module.exports = app;
// eslint-disable-next-line no-console
console.log('Listening on port 3000');
