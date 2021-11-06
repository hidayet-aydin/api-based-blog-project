const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

var isValidMiddleware = rewire("../middlewares/is-valid");

describe("Middlewares of is-Validation Testing", () => {
  context("authRegister Unit Test", () => {
    let req;
    beforeEach(() => {
      req = {
        body: {
          email: "foo@test.com",
          password: "abc123",
          name: "jhon",
        },
      };

      findOneStub = sandbox.stub().resolves(false);
      isValidMiddleware.__set__("User.findOne", findOneStub);
    });
    afterEach(() => {
      sandbox.restore();
      sandbox.reset();
      isValidMiddleware = rewire("../middlewares/is-valid");
    });

    it("should throw an error if email of required body parameter is missing.", (done) => {
      req = {
        body: {
          password: "abc123",
          name: "jhon",
        },
      };
      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Please enter a valid email.");
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if password of required body parameter is missing.", (done) => {
      req = {
        body: {
          email: "foo@test.com",
          name: "jhon",
        },
      };
      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal(
          "Please enter a valid password (min 5 and max 20 length)."
        );
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if name of required body parameter is missing.", (done) => {
      req = {
        body: {
          email: "foo@test.com",
          password: "abc123",
        },
      };
      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Username should not be empty.");
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if email is already exist.", (done) => {
      findOneStub = sandbox.stub().resolves(true);
      isValidMiddleware.__set__("User.findOne", findOneStub);

      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Email address already exists!");
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if password is less than 5 characters.", (done) => {
      req = {
        body: {
          email: "foo@test.com",
          password: "123",
          name: "jhon",
        },
      };
      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal(
          "Please enter a valid password (min 5 and max 20 length)."
        );
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if password is more than 20 characters.", (done) => {
      req = {
        body: {
          email: "foo@test.com",
          password: "1234567890111213141516",
          name: "jhon",
        },
      };
      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal(
          "Please enter a valid password (min 5 and max 20 length)."
        );
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if password is not alphanumeric.", (done) => {
      req = {
        body: {
          email: "foo@test.com",
          password: "123456",
          name: "jhon",
        },
      };
      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Password should be alphanumeric.");
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if mongodb gives an error.", (done) => {
      findOneStub = sandbox.stub().throws(new Error("fake findOne error"));
      isValidMiddleware.__set__("User.findOne", findOneStub);

      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("fake findOne error");
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if express-validator(validationResult) gives an error.", (done) => {
      findOneStub = sandbox
        .stub()
        .throws(new Error("fake validationResult error"));
      isValidMiddleware.__set__("validationResult", findOneStub);

      isValidMiddleware.authRegister(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("fake validationResult error");
        expect(err).to.own.include({ statusCode: 500 });
        done();
      });
    });

    it("should be ok.", (done) => {
      isValidMiddleware.authRegister(req, {}, (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.be.undefined;
        done();
      });
    });
  });

  context("authUpdate Unit Test", () => {
    let req;
    beforeEach(() => {
      req = {
        body: {
          newMail: "foo@test.com",
          newName: "jhon",
        },
      };

      findOneStub = sandbox.stub().resolves(false);
      isValidMiddleware.__set__("User.findOne", findOneStub);
    });
    afterEach(() => {
      sandbox.restore();
      sandbox.reset();
      isValidMiddleware = rewire("../middlewares/is-valid");
    });

    it("should throw an error if email is already exist.", (done) => {
      findOneStub = sandbox.stub().resolves(true);
      isValidMiddleware.__set__("User.findOne", findOneStub);

      isValidMiddleware.authUpdate(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Email address already exists!");
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should be ok.", (done) => {
      isValidMiddleware.authUpdate(req, {}, (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.be.undefined;
        done();
      });
    });
  });

  context("authPassword Unit Test", () => {
    let req;
    beforeEach(() => {
      req = {
        body: {
          newPassword: "abc123",
          confirmPassword: "abc123",
        },
      };
    });

    it("should throw an error if new password and cinform password is not match.", (done) => {
      req = {
        body: {
          newPassword: "abc123",
          confirmPassword: "abc1234",
        },
      };
      isValidMiddleware.authPassword(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Passwords have to match!");
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should throw an error if password is not alphanumeric.", (done) => {
      req = {
        body: {
          newPassword: "123456",
          confirmPassword: "123456",
        },
      };
      isValidMiddleware.authPassword(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Password should be alphanumeric.");
        expect(err).to.own.include({ statusCode: 422 });
        done();
      });
    });

    it("should be ok.", (done) => {
      isValidMiddleware.authPassword(req, {}, (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.be.undefined;
        done();
      });
    });
  });
});
