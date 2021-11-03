const chai = require("chai");
const sinon = require("sinon");
const rewire = require("rewire");

const expect = chai.expect;
const sandbox = sinon.createSandbox();

var authMiddleware = rewire("./is-auth");

context("Middleware of Authentication Testing", () => {
  describe("JWT verifying", () => {
    let req;
    let userReturn;
    let jwtVerifyStub;
    beforeEach(() => {
      req = { get: () => "Bearer asdf.asdfasdf.asdfasdf" };
      userReturn = { userId: "123", userEmail: "user@foo.com", name: "foo" };
      jwtVerifyStub = sandbox.stub();
      authMiddleware.__set__("verify", jwtVerifyStub);
    });
    afterEach(() => {
      sandbox.restore();
      authMiddleware = rewire("./is-auth");
    });

    it("should return userId and userEmail after decoding the token.", () => {
      jwtVerifyStub.returns(userReturn);

      authMiddleware(req, {}, () => {});
      expect(req).to.have.property("userId");
      expect(req).to.have.property("userEmail");
      expect(jwtVerifyStub.called).to.be.true;
    });

    it("should throw an error if jwt has an internal error.", () => {
      jwtVerifyStub.throws(new Error("fake error"));

      expect(authMiddleware.bind(this, req, {}, () => {}))
        .to.throw(Error, "fake error")
        .with.property("statusCode", 500);
      expect(jwtVerifyStub.called).to.be.true;
    });

    it("should throw an error if getting a not-authenticated token.", () => {
      jwtVerifyStub.returns(null);

      expect(() => authMiddleware(req, {}, () => {}))
        .to.throw("Not authenticated.")
        .with.property("statusCode", 401);
      expect(jwtVerifyStub.called).to.be.true;
    });
  });
});
