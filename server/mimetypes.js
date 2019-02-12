const stats = require('./stat');

const uploadableTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    DIRECTORY: 'DIRECTORY',
};

/**
 * This returns an extension for a given filetype, if it's on the list of accepted types
 * @param {string} mimetype
 */
const getExtensionFromAcceptedMimeType = (mimetype) => {
    const extension = Object.getOwnPropertyNames(uploadableTypes).filter(
        type => uploadableTypes[type] === mimetype
    );
    // console.log("mime-type:", mimetype, extension);
    return extension.length ? extension[0] : '';
};

const isListableFileType = (path) => {
    const result = !!getExtensionFromAcceptedMimeType(stats.getMimeTypeAndExtension(path).mimetype);

    return !!result;
};

const isListableMimeType = mimetype => Object.getOwnPropertyNames(uploadableTypes).some(
    extension => uploadableTypes[extension] === mimetype
);

module.exports = {
    getExtensionFromAcceptedMimeType,
    isListableFileType,
    isListableMimeType,
    uploadableTypes,
};
