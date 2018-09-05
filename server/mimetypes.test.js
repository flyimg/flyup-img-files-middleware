const expect = require('chai').expect;
const mimetypes = require('./mimetypes');

// getExtensionFromAcceptedMimeType

describe('Mime-type handling methods ', () => {
    describe('getExtensionFromAcceptedMimeType method', () => {
        it('should return correct extension png given mimemtype image/png', () => {
            const extension = mimetypes.getExtensionFromAcceptedMimeType('image/png');
            expect(extension).to.be.a('string');
            expect(extension).to.equal('png');
        });

        it('should return correct extension jpg given mimemtype image/jpeg', () => {
            const extension = mimetypes.getExtensionFromAcceptedMimeType('image/jpeg');
            expect(extension).to.be.a('string');
            expect(extension).to.equal('jpg');
        });
    });
});

//
