const expect = require('chai').expect;
const stats = require('./stat');

// isDirectory
// isDirectorySync

describe('Folder and File Stat, a collection of methods ', () => {
    describe('getMimeTypeAndExtension method', () => {
        it('should return correct mime for a given filename', () => {
            const fileMime = stats.getMimeTypeAndExtension('some/path.jpg');
            expect(fileMime).to.be.an('object');
            expect(fileMime.type).to.equal('image/jpeg');
            expect(fileMime.extension).to.equal('jpg');
        });
    });
});
