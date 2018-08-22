const expect = require('chai').expect;
const stats = require('./stat');

// isDirectory
// isDirectorySync

describe('Folder and File Stat, a collection of methods ', () => {
    describe('getMimeTypeAndExtension method', () => {
        it('should return correct mimetype property for a given filename', () => {
            const fileMime = stats.getMimeTypeAndExtension('some/path.jpg');
            expect(fileMime).to.be.an('object');
            expect(fileMime.mimetype).to.equal('image/jpeg');
        });

        it('should return correct extension property for a given filename', () => {
            const fileMime = stats.getMimeTypeAndExtension('some/path.jpg');
            expect(fileMime).to.be.an('object');
            expect(fileMime.extension).to.equal('jpg');
        });

        it('should return text/plain mimetype property for unkown extension filename', () => {
            const fileMime = stats.getMimeTypeAndExtension('some/path.notarealextension');
            expect(fileMime).to.be.an('object');
            expect(fileMime.mimetype).to.equal('text/plain');
        });
    });
});
