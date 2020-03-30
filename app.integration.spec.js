const request = require('supertest');

const app = require('./index');
const agent = request.agent(app);

const mockUser = 'username=randombrandon&password=randompassword';

const mockError = {
  errors: {
    personalWebsiteURL: "URL must be a valid HTTP URL starting with http:// or https://"
  }
}

const mockCorrectData = 'content=I should work&personalWebsiteURL=https://placedog.net/500';

const mockWrongData = 'content=I will not get Hacked Today&personalWebsiteURL=javascript:alert("Hacked!");';

describe('app', () => {
  describe('when authenticated', () => {
    beforeEach(async () => {
      await agent
        .post('/login')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send(mockUser)
    });

    describe('POST /messages', () => {
      describe('with non-empty content', () => {
        describe('with JavaScript code in personalWebsiteURL', () => {
          it('responds with error', async done => {
            await agent
              .post('/messages')
              .send(mockWrongData)
              .set('Accept', 'application/x-www-form-urlencoded')
              .expect('Content-Type', /json/)
              .expect(400)
              .expect(mockError)
            done();
          });
        });

        describe('with HTTP URL in personalWebsiteURL', () => {
          it('responds with success', async done => {
            await agent
              .post('/messages')
              .send(mockCorrectData)
              .set('Accept', 'application/x-www-form-urlencoded')
              .expect('Content-Type', /json/)
              .expect(201)
            done();
          });
        });
      });
    });
  });
});