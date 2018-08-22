const expect = require('chai').expect;
const mimetypes = require('./mimetypes');

// getExtensionFromAcceptedMimeType

describe('Unit functions currently in the app.js ', () => {
    describe('getExtensionFromAcceptedMimeType method', () => {
        it('should return correct extension given mimemtype', () => {
            const extension = mimetypes.getExtensionFromAcceptedMimeType('image/png');
            expect(extension).to.be.a('string');
            expect(extension).to.equal('png');
        });

    });
});

//
