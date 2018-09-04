require('dotenv').config();

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const glob = require('glob');
const fs = require('fs');
const fse = require('fs-extra');

const stats = require('./stat');
const mimetypes = require('./mimetypes');

const API_MEDIA_URL = process.env.API_MEDIA_URL;
const STORAGE_FOLDER = process.env.STORAGE_FOLDER;

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
app.use(bodyParser.json());
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
        res.status(404).json();
        return;
    }

    req.next();
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
        maskedPath + '*', {
            cwd: STORAGE_FOLDER,
        },
        (err, files) => {
            res.status(200).json(
                files
                .map(file => {
                    const relativeStoragePath = STORAGE_FOLDER + file;
                    return stats.fileInfo(relativeStoragePath);
                })
                .filter((file) => {
                    return mimetypes.isListableMimeType(file.mimetype);
                })
            );
        }
    );
});

app.post(API_MEDIA_URL + '*', (req, res) => {
    console.log('2. ---- posting to media path: ', req.url);

    // if it is a dir
    let maskedPath = req.maskedPath;
    // add trailing slash if missing
    maskedPath = !maskedPath || maskedPath.substr(-1) === '/' ? maskedPath : maskedPath + '/';

    // if there is no name property: fail
    if (!req.body.name) {
        res.status(400).json({
            error: 400,
            message: 'ERROR: missing "name" attribute in the post data.'
        })
        return;
    }

    const newFolderName = require('url').parse(req.body.name).pathname;

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
    })
    return;
});

app.delete(API_MEDIA_URL + '*', (req, res) => {
    console.log('3. ---- delete media path: ', req.url);

    let maskedPath = req.maskedPath;

    // if the path is the media root, it should not be allowed to delete
    if (!maskedPath) {
        res.status(405).json({
            error: 405,
            message: 'Method (DELETE) not alowed for this route.'
        })
        return;
    }

    const fsPath = req.fsPath;
    // if it is not a dir, check the filetype is listable (and deletable)
    if (!stats.isDirectorySync(fsPath)) { // this is a file
        if (mimetypes.isListableFileType(fsPath)) {
            fse.removeSync(fsPath);
            res.status(200).json({
                name: maskedPath
            });
        } else {
            // then this is not a file suposed to be seen
            res.status(404).json();
        }
    } else { // this is a folder
        fse.removeSync(fsPath);
        res.status(200).json({
            name: maskedPath
        });
    }
});

if (!module.parent) {
    app.listen(3000);
}
module.exports = app;
console.log('Listening on port 3000');
