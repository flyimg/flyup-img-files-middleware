const multer = require('multer');
const mimetypes = require('./file-handling/mimetypes');
const stats = require('./file-handling/stat');

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

module.exports = upHandler;
