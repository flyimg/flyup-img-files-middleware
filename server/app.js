const express = require("express");
const multer = require("multer");
const morgan = require("morgan");

const uploadableTypes = {
    png: "image/png",
    jpg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
};

/**
 * This returns an extension for a given filetype, if it's on the list of accepted types
 * @param {string} mimetype
 */
const getExtensionFromAcceptedMimeType = mimetype => {
    const extension = Object.getOwnPropertyNames(uploadableTypes).filter(
        type => uploadableTypes[type] === mimetype
    );
    //console.log("mime-type:", mimetype, extension);
    return extension.length ? extension : "";
};

const upHandler = multer({
    fileFilter: (req, file, cb) => {
        // @todo: make sure the mimetype is actualy the one advertized by the extension. @see issue #1
        const extension = getExtensionFromAcceptedMimeType(file.mimetype);

        cb(null, !!extension);
        // but nothing will stop, multer just won't save the file, express will happyly continue it's flow,
        // so we need to make the check again to send the proper response
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/");
        },
        filename: (req, file, cb) => {
            const mimetype = file.mimetype;
            const extension =
                "." +
                Object.getOwnPropertyNames(uploadableTypes).filter(
                    type => uploadableTypes[type] === mimetype
                );
            let filename = file.originalname;
            filename +=
                filename.substr(-extension.length) === extension
                    ? ""
                    : extension;
            console.log("will save to ", filename);
            cb(null, filename);
        },
    }),
});

const app = express();

app.use(morgan("dev"));
app.use(express.static("server/static"));

app.post("/upload", upHandler.single("uploaded_file"), (req, res) => {
    //res.status(201).send({ path: "some-path-will-be-here.jpg" });
    res.sendStatus(201);
});

app.get("/media/{folderPath}", (req, res) => {});

app.listen(3000);
console.log("Listening on port 3000");
