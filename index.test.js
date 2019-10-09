const request = require("supertest");
const nock = require('nock');

const {sentryAPIbase, projectID, orgSlug} = require('./constants');
const testOrgSlug = 'testOrg';
const testProjectID = '123456';
const testIssueID = '987654';
const testUserNames = ['testEmail@test.com', 'otherTestEmail@test.com'];

// Mocked API response bodies:
const mockGetUsersResponse = [{"dateCreated":"2019-05-09T18:06:01.728Z","user":{"username":testUserNames[0],"lastLogin":"2019-09-16T02:56:06.806Z","isSuperuser":false,"isManaged":false,"lastActive":"2019-10-08T15:05:38.715Z","isStaff":false,"id":"433307","isActive":true,"has2fa":false,"name":"OtherTest McTestuser","avatarUrl":"https://secure.gravatar.com/avatar/1eb103c0e899f372a85eb0a44f0a0f42?s=32&d=mm","dateJoined":"2019-05-09T18:06:01.443Z","emails":[{"is_verified":true,"id":"468229","email":testUserNames[0]}],"avatar":{"avatarUuid":null,"avatarType":"letter_avatar"},"hasPasswordAuth":false,"email":testUserNames[0]},"roleName":"Organization Owner","expired":false,"id":"9376061","projects":["buggy-sentry-project"],"name":"OtherTest McTestuser","role":"owner","flags":{"sso:linked":false,"sso:invalid":false},"email":testUserNames[0],"pending":false},{"dateCreated":"2019-09-30T16:06:51.949Z","user":{"username":testUserNames[1],"lastLogin":"2019-09-30T16:08:10.517Z","isSuperuser":false,"isManaged":false,"lastActive":"2019-10-02T23:15:43.773Z","isStaff":false,"id":"518100","isActive":true,"has2fa":false,"name":"OtherTest McTestuser","avatarUrl":"https://secure.gravatar.com/avatar/7828bc81ef4bbd6d38d749803e1a02c6?s=32&d=mm","dateJoined":"2019-09-30T16:08:09.839Z","emails":[{"is_verified":true,"id":"562269","email":testUserNames[1]}],"avatar":{"avatarUuid":null,"avatarType":"letter_avatar"},"hasPasswordAuth":true,"email":testUserNames[1]},"roleName":"Member","expired":false,"id":"9496972","projects":["buggy-sentry-project"],"name":"OtherTest McTestuser","role":"member","flags":{"sso:linked":false,"sso:invalid":false},"email":testUserNames[1],"pending":false}];

describe("index.js", () => {
  let server;
  beforeAll((done) => {
    // Mock out the initial request to get project users (on server startup)
    nock(sentryAPIbase)
      .get(`/organizations/${testOrgSlug}/users/?project=${testProjectID}`)
      .reply(200, mockGetUsersResponse);

    const app = require("./app");
    app.use(function(err, req, res, next) {
      console.error(err.stack); // Explicitly output any stack trace dumps to stderr
      next(err, req, res);
    });
    server = app.listen(process.env.PORT, done);
  });

  afterAll(() => {
    server.close();
  });

  test("post / (webhook)", done => {
    request(server)
      .post("/")
      .set({ "Sentry-Hook-Resource": "issue" })
      .send({ action: "created", data: { issue: { id: "1337" } } })
      .expect(404, done);
  });
});