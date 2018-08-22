const express = require('express');
const multer = require('multer');
const cors = require('cors');
const morgan = require('morgan');
const glob = require('glob');
const fs = require('fs');

const stats = require('./stat');
const mimetypes = require('./mimetypes');

// These should be coming from some config ir ENV var.
const API_MEDIA_URL = '/api/media';
const STORAGE_FOLDER = 'uploads/';

const upHandler = multer({
    fileFilter: (req, file, cb) => {
        // @todo: make sure the mimetype is actualy the one advertized by the extension. @see issue #1
        const extension = mimetypes.getExtensionFromAcceptedMimeType(file.mimetype);

        cb(null, !!extension);
        // but nothing will stop, multer just won't save the file, express will happyly continue it's flow,
        // so we need to make the check again to send the proper response
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, STORAGE_FOLDER);
        },
        filename: (req, file, cb) => {
            const mimetype = file.mimetype;
            const extension =
                '.' +
                Object.getOwnPropertyNames(mimetypes.uploadableTypes).filter(
                    type => mimetypes.uploadableTypes[type] === mimetype
                );
            let filename = file.originalname;
            filename += filename.substr(-extension.length) === extension ? '' : extension;
            console.log('will save to ', filename);
            cb(null, filename);
        },
    }),
});

/** configure CORS */
const originsWhitelist = [
    'http://localhost:4200', //this is my front-end url for development
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

app.use(morgan('dev')); // <-- is this doing anything?
// body parser should go here
app.use(cors(corsOptions));
app.use(express.static('server/static'));
// TODO: add serve-static middleware to serve the static files ( https://github.com/expressjs/serve-static )

app.post('/api/upload', upHandler.single('uploaded_file'), (req, res) => {
    //res.status(201).send({ path: "some-path-will-be-here.jpg" });
    if (!req.file || !mimetypes.getExtensionFromAcceptedMimeType(req.file.mimetype)) {
        return res.status(422).json({
            error: 'The uploaded file must be an image',
        });
    } else {
        res.status(201).json({});
    }
});

app.get(API_MEDIA_URL + '*', (req, res) => {
    console.log('1. ---- getting media path! ... ', req.url);

    // this is the path without API_MEDIA_URL sufix
    let maskedPath = req.url.substr(API_MEDIA_URL.length + 1);
    // this normalizes the trailing slash on root.
    maskedPath = maskedPath === '/' ? '' : maskedPath;

    // path of the resource in the file system
    const fsPath = STORAGE_FOLDER + maskedPath;

    // if no file and no dir exist, return 404
    if (!fs.existsSync(fsPath)) {
        res.status(404).json();
        return;
    }

    // if it is not a dir, get the file data
    if (!stats.isDirectorySync(fsPath)) {
        if (mimetypes.isListableFileType(fsPath)) {
            res.status(200).json({
                stats: fs.statSync(fsPath)
            });
        } else {
            res.status(404).json();
        }
        return;
    }

    // if it is a dir
    // add trailing slash if missing
    maskedPath = !maskedPath || maskedPath.substr(-1) === '/' ? maskedPath : maskedPath + '/';

    // match one or more of these patterns
    const visibleExtensionsGlob = '*.' + Object.getOwnPropertyNames(mimetypes.uploadableTypes).join('|*.');
    const globPath = maskedPath + '*'; // `${(maskedPath ? maskedPath : '')}@(${visibleExtensionsGlob})`;
    glob(
        globPath, {
            cwd: STORAGE_FOLDER,
        },
        (err, files) => {
            res.status(200).json(
                files.map(file => {
                    const relativeStoragePath = STORAGE_FOLDER + file;
                    const fileStat = fs.statSync(relativeStoragePath);
                    return {
                        mtime: fileStat.mtime,
                        name: file,
                        size: fileStat.size,
                        ...stats.getMimeTypeAndExtension(relativeStoragePath),
                    };
                })
            );
        }
    );
});

if (!module.parent) {
    app.listen(3000);
}
module.exports = app;
console.log('Listening on port 3000');
