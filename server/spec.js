const request = require('supertest');
const app = require('./app');
const expect = require('chai').expect;

// TODO: setup tests on filesystem to not depend on having files, also add cleanup later.
describe('GET api/media', () => {
    it('should return a folder`s content listed', done => {
        request(app)
            .get('/api/media/')
            .set('Accept', 'application/json')
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                console.log('gettign response');
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                done();
            });
    });
});
