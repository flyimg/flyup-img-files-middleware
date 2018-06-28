const express = require("express");
const multer = require("multer");
const cors = require("cors");
const morgan = require("morgan");
const glob = require("glob");
const fs = require("fs");

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

/** configure CORS */
const originsWhitelist = [
    "http://localhost:4200", //this is my front-end url for development
    "http://no.clue.yet",
];
const corsOptions = {
    origin: (origin, callback) => {
        const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true,
};

const app = express();

app.use(morgan("dev"));
// body parser should go here
app.use(cors(corsOptions));
app.use(express.static("server/static"));

app.post("/api/upload", upHandler.single("uploaded_file"), (req, res) => {
    //res.status(201).send({ path: "some-path-will-be-here.jpg" });
    if (!req.file || !getExtensionFromAcceptedMimeType(req.file.mimetype)) {
        return res.status(422).json({
            error: "The uploaded file must be an image",
        });
    } else {
        res.sendStatus(201);
    }
});

// this should be configurable
app.get("/api/media/*", (req, res) => {
    console.log("getting media path!");
    console.log("path:", req.url);
    // match one or more of these patterns
    glob("uploads/*.*", (err, files) => {
        res.status(200).json(
            files.map(file => {
                const fileStat = fs.statSync(file);
                return {
                    mtime: fileStat.mtime,
                    name: file,
                    size: fileStat.size,
                };
            })
        ); //.send("listing.... for" + req.url);
    });
});

app.listen(3000);
console.log("Listening on port 3000");
