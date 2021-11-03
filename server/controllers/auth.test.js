const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var authController = rewire("../controllers/auth");

describe("Controller of Authentication Testing", () => {
  context("POST Register Unit Test", () => {
    let req;
    let bcryptHashStub;
    let userReturn;
    let jwtSignStub;
    beforeEach(() => {
      req = {
        body: {
          email: "user@foo.com",
          password: "123",
          name: "foo",
        },
      };
      bcryptHashStub = sandbox.stub(bcrypt, "hash");

      userReturn = {
        _id: "123",
        email: "user@foo.com",
        name: "foo",
        save: sandbox.stub().resolves(),
      };
      saveStub = sandbox.stub().returns(userReturn);
      authController.__set__("User", saveStub);

      jwtSignStub = sandbox.stub(jwt, "sign").returns("123456");
    });
    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      authController = rewire("../controllers/auth");
    });

    it("should throw an error if bcryptjs has an internal error.", (done) => {
      bcryptHashStub.throws(new Error("fake brcyptjs error"));

      authController.postRegister(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake brcyptjs error");
        expect(bcryptHashStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      const fakeErrorStub = sandbox.stub().throws(new Error("fake user error"));
      authController.__set__("User", fakeErrorStub);

      authController.postRegister(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake user error");
        expect(fakeErrorStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if jwt has an internal error.", (done) => {
      jwtSignStub.throws(new Error("fake jwt error"));

      authController.postRegister(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake jwt error");
        expect(jwtSignStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should be ok.", (done) => {
      const res = {
        status: (code) => {
          return {
            json: (master) => {
              const body = {
                ...master,
                statusCode: code,
              };
              const error = new Error(JSON.stringify(body));
              throw error;
            },
          };
        },
      };
      const errCheck = `{"message":"User Created!","master":{"email":"user@foo.com","name":"foo","token":"123456"},"statusCode":201}`;
      authController.postRegister(req, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal(errCheck);
        done();
      });
    });
  });

  context("POST Login Unit Test", () => {
    let req;
    let bcryptCompareStub;
    let userReturn;
    let jwtSignStub;
    beforeEach(() => {
      req = {
        body: {
          email: "user@foo.com",
          password: "123",
        },
      };

      userReturn = {
        _id: "123",
        email: "user@foo.com",
        name: "foo",
      };
      findOneStub = sandbox.stub().returns(userReturn);
      authController.__set__("User.findOne", findOneStub);

      bcryptCompareStub = sandbox.stub(bcrypt, "compare").resolves(true);

      jwtSignStub = sandbox.stub(jwt, "sign").returns("123456");
    });
    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      authController = rewire("../controllers/auth");
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      const fakeErrorStub = sandbox
        .stub()
        .throws(new Error("fake findOne error"));
      authController.__set__("User.findOne", fakeErrorStub);

      authController.postLogin(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake findOne error");
        expect(fakeErrorStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should return empty user if there is not any match for email", (done) => {
      const fakeErrorStub = sandbox.stub().resolves(undefined);
      authController.__set__("User.findOne", fakeErrorStub);

      authController.postLogin(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("This user could not find!");
        expect(fakeErrorStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if bcryptjs has an internal error.", (done) => {
      bcryptCompareStub.throws(new Error("fake bcryptjs error"));

      authController.postLogin(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake bcryptjs error");
        expect(bcryptCompareStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if password is not match.", (done) => {
      bcryptCompareStub.resolves(false);

      authController.postLogin(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("Wrong password!");
        expect(bcryptCompareStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if jwt has an internal error.", (done) => {
      jwtSignStub.throws(new Error("fake jwt error"));

      authController.postLogin(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake jwt error");
        expect(jwtSignStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should be ok.", (done) => {
      const res = {
        status: (code) => {
          return {
            json: (master) => {
              const body = {
                ...master,
                statusCode: code,
              };
              const error = new Error(JSON.stringify(body));
              throw error;
            },
          };
        },
      };
      const errCheck = `{"message":"Login User","master":{"email":"user@foo.com","name":"foo","token":"123456"},"statusCode":201}`;
      authController.postLogin(req, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal(errCheck);
        done();
      });
    });
  });

  context("PATCH Update User Unit Test", () => {
    let req;
    let userReturn;
    beforeEach(() => {
      req = {
        userId: "123",
        body: {
          newMail: "user@foo.com",
          newName: "foo",
        },
      };

      userReturn = {
        _id: "123",
        email: "user@foo.com",
        name: "foo",
        save: sandbox.stub().resolves(),
      };
      findOneStub = sandbox.stub().resolves(userReturn);
      authController.__set__("User.findOne", findOneStub);
    });
    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      authController = rewire("../controllers/auth");
    });

    it("should throw an err if there is not any change value.", (done) => {
      req = { userId: "123", body: {} };

      authController.patchUpdate(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal("There is nothing to change!");
        done();
      });
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      const fakeErrorStub = sandbox
        .stub()
        .throws(new Error("fake findOne error"));
      authController.__set__("User.findOne", fakeErrorStub);

      authController.patchUpdate(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal("fake findOne error");
        expect(fakeErrorStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if userId is not match.", (done) => {
      const findOneStub = sandbox.stub().resolves(false);
      authController.__set__("User.findOne", findOneStub);

      authController.patchUpdate(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("Invalid Authentication!");
        expect(findOneStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should be ok.", (done) => {
      const res = {
        status: (code) => {
          return {
            json: (master) => {
              const body = {
                ...master,
                statusCode: code,
              };
              const error = new Error(JSON.stringify(body));
              throw error;
            },
          };
        },
      };

      const errCheck = `{"message":"Updated User Info","master":{"email":"user@foo.com","name":"foo"},"statusCode":200}`;
      authController.patchUpdate(req, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal(errCheck);
        done();
      });
    });
  });

  context("PUT Password User Unit Test", () => {
    let req;
    let userReturn;
    let bcryptHashStub;
    beforeEach(() => {
      req = {
        userId: "123",
        body: {
          newPassword: "abc123",
        },
      };

      userReturn = {
        _id: "123",
        email: "user@foo.com",
        name: "foo",
        save: sandbox.stub().resolves(),
      };
      findOneStub = sandbox.stub().returns(userReturn);
      authController.__set__("User.findOne", findOneStub);

      bcryptHashStub = sandbox.stub(bcrypt, "hash");
    });
    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      authController = rewire("../controllers/auth");
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      bcryptHashStub.throws(new Error("fake bcryptjs error"));

      authController.putPassword(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal("fake bcryptjs error");
        expect(bcryptHashStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if userId is not match.", (done) => {
      const findOneStub = sandbox.stub().resolves(false);
      authController.__set__("User.findOne", findOneStub);

      authController.putPassword(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("Invalid Authentication!");
        expect(findOneStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should be ok.", (done) => {
      const res = {
        status: (code) => {
          return {
            json: (master) => {
              const body = {
                ...master,
                statusCode: code,
              };
              const error = new Error(JSON.stringify(body));
              throw error;
            },
          };
        },
      };
      const errCheck = `{"message":"Password Successfully Changed!","master":{"email":"user@foo.com","name":"foo"},"statusCode":200}`;
      authController.putPassword(req, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal(errCheck);
        done();
      });
    });
  });

  context("DELETE User Unit Test", () => {
    let req;
    let userReturn;
    beforeEach(() => {
      req = {
        userId: "123",
        userEmail: "foo@test.com",
      };

      userReturn = {
        _id: "123",
        email: "user@foo.com",
        name: "foo",
        deleteOne: sandbox.stub().resolves(),
      };
      findOneStub = sandbox.stub().returns(userReturn);
      authController.__set__("User.findOne", findOneStub);
    });
    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      authController = rewire("../controllers/auth");
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      const fakeErrorStub = sandbox
        .stub()
        .throws(new Error("fake findOne error"));
      authController.__set__("User.findOne", fakeErrorStub);

      authController.deleteUser(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal("fake findOne error");
        expect(fakeErrorStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if userId is not match.", (done) => {
      const findOneStub = sandbox.stub().resolves(false);
      authController.__set__("User.findOne", findOneStub);

      authController.deleteUser(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("Invalid Authentication!");
        expect(findOneStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should be ok.", (done) => {
      const res = {
        status: (code) => {
          return {
            json: (master) => {
              const body = {
                ...master,
                statusCode: code,
              };
              const error = new Error(JSON.stringify(body));
              throw error;
            },
          };
        },
      };
      const errCheck = `{"message":"User Deleted!","email":"foo@test.com","statusCode":200}`;
      authController.deleteUser(req, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal(errCheck);
        done();
      });
    });
  });

  context("POST Image Upload Unit Test", () => {
    let req;
    let s3ReturnStub;
    let s3Return;
    beforeEach(() => {
      req = {
        file: null, //{ path: null /*"blabla.png"*/ },
        body: {
          bucketName: null, //"blabla",
          region: null, //"istanbul",
          accessKeyId: null, //"123",
          secretAccessKey: null, //"somesecret",
        },
      };

      s3Return = {
        uploadFile: () => {
          return { location: "s3_ok!" };
        },
      };
      s3ReturnStub = sandbox.stub().returns(s3Return);
      authController.__set__("s3", s3ReturnStub);
    });
    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      authController = rewire("../controllers/auth");
    });

    it("should throw an error if it is not attach an image file", (done) => {
      authController.postUpload(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("Attached file is not image.!");
        done();
      });
    });

    it("should be ok without s3 upload.", (done) => {
      req = {
        file: { path: "blabla.png" },
        body: {
          bucketName: null,
          region: null,
          accessKeyId: null,
          secretAccessKey: null,
        },
      };

      const res = {
        status: (code) => {
          return {
            json: (master) => {
              const body = {
                ...master,
                statusCode: code,
              };
              const error = new Error(JSON.stringify(body));
              throw error;
            },
          };
        },
      };

      const errCheck = `{"message":"Image Uploaded","imageUrl":"blabla.png","statusCode":200}`;
      authController.postUpload(req, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal(errCheck);
        done();
      });
    });

    it("should be ok with s3 upload.", (done) => {
      req = {
        file: { path: "blabla.png" },
        body: {
          bucketName: "blabla",
          region: "istanbul",
          accessKeyId: "123",
          secretAccessKey: "somesecret",
        },
      };

      const res = {
        status: (code) => {
          return {
            json: (master) => {
              const body = {
                ...master,
                statusCode: code,
              };
              const error = new Error(JSON.stringify(body));
              throw error;
            },
          };
        },
      };

      const errCheck = `{"message":"Image Uploaded","imageUrl":"s3_ok!","statusCode":200}`;
      authController.postUpload(req, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal(errCheck);
        done();
      });
    });
  });
});
