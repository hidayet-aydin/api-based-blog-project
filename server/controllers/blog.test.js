const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

var blogController = rewire("../controllers/blog");

describe("Controllers of Blog Testing", () => {
  const res = {
    status: (code) => {
      return {
        json: (pack) => {
          const body = {
            ...pack,
            statusCode: code,
          };
          const error = new Error(JSON.stringify(body));
          throw error;
        },
      };
    },
  };

  context("GET Recently Unit Test", () => {
    let blogsSample, blogStub, findStub, populateStub, sortStub, limitStub;
    beforeEach(() => {
      blogsSample = [
        {
          _id: "12",
          title: "Title1",
          userId: "u1",
          createdAt: "2021-11-03",
          updatedAt: "2021-11-01",
        },
      ];
    });

    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      blogController = rewire("../controllers/blog");
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      limitStub = sandbox.stub().throws(new Error("fake mongo error"));
      sortStub = sandbox.stub().returns({ limit: limitStub });
      populateStub = sandbox.stub().returns({ sort: sortStub });
      findStub = sandbox.stub().returns({ populate: populateStub });
      blogStub = { find: findStub };
      blogController.__set__("Blog", blogStub);

      blogController.getRecently({}, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake mongo error");
        expect(findStub).to.have.been.calledOnce;
        expect(populateStub).to.have.been.calledOnce;
        expect(sortStub).to.have.been.calledOnce;
        expect(limitStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should throw an error if there is not any blog.", (done) => {
      limitStub = sandbox.stub().resolves(false);
      sortStub = sandbox.stub().returns({ limit: limitStub });
      populateStub = sandbox.stub().returns({ sort: sortStub });
      findStub = sandbox.stub().returns({ populate: populateStub });
      blogStub = { find: findStub };
      blogController.__set__("Blog", blogStub);

      blogController.getRecently({}, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("Blogs could not find!");
        expect(findStub).to.have.been.calledOnce;
        expect(populateStub).to.have.been.calledOnce;
        expect(sortStub).to.have.been.calledOnce;
        expect(limitStub).to.have.been.calledOnce;
        done();
      });
    });

    it("should be ok.", (done) => {
      limitStub = sandbox.stub().resolves(blogsSample);
      sortStub = sandbox.stub().returns({ limit: limitStub });
      populateStub = sandbox.stub().returns({ sort: sortStub });
      findStub = sandbox.stub().returns({ populate: populateStub });
      blogStub = { find: findStub };
      blogController.__set__("Blog", blogStub);

      blogController.getRecently({}, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        const jsonErr = JSON.parse(err.message);
        expect(jsonErr).to.own.include({ message: "Successful" });
        expect(jsonErr).to.have.property("recent_blogs");
        expect(jsonErr).to.own.include({ statusCode: 200 });
        done();
      });
    });
  });

  context("GET List Unit Test", () => {
    let blogsSample;
    let blogFindStub;
    beforeEach(() => {
      blogsSample = [
        {
          _id: "12",
          title: "Title1",
          createdAt: "2021-11-03",
          updatedAt: "2021-11-01",
        },
      ];
      blogFindStub = sandbox.stub().resolves(blogsSample);
      blogController.__set__("Blog.find", blogFindStub);
    });

    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      blogController = rewire("../controllers/blog");
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      blogFindStub.throws(new Error("fake find error"));

      blogController.getList({}, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake find error");
        done();
      });
    });

    it("should throw an error if there is not any matched blog.", (done) => {
      blogFindStub.resolves(false);

      blogController.getList({}, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("Invalid Authentication!");
        done();
      });
    });

    it("should be ok.", (done) => {
      // `{"message":"Successful","my_blogs":[{"id":"12","title":"Title1","created":"2021-11-03","updated":"2021-11-01"}],"statusCode":200}`;
      blogController.getList({}, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        const jsonErr = JSON.parse(err.message);
        expect(jsonErr).to.own.include({ message: "Successful" });
        expect(jsonErr).to.have.property("my_blogs");
        expect(jsonErr).to.own.include({ statusCode: 200 });
        done();
      });
    });
  });

  context("POST Blog Unit Test", () => {
    let req;
    let blogStub;
    beforeEach(() => {
      req = {
        userId: "123",
        body: {
          title: "Title",
          shortContent: "short",
          content: "content",
        },
      };

      newBlog = {
        _id: "b123",
        save: sandbox.stub().resolves(),
      };
      blogStub = sandbox.stub().returns(newBlog);
      blogController.__set__("Blog", blogStub);
    });

    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      blogController = rewire("../controllers/blog");
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      blogStub.throws(new Error("fake find error"));
      blogController.__set__("Blog", blogStub);

      blogController.postBlog(req, {}, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).equal("fake find error");
        done();
      });
    });

    it("should be ok.", (done) => {
      // `{"message":"Blog Posted!","blogId":"b123","statusCode":201}`;
      blogController.postBlog(req, res, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.be.instanceOf(Error);
        const jsonErr = JSON.parse(err.message);
        expect(jsonErr).to.own.include({ message: "Blog Posted!" });
        expect(jsonErr).to.own.include({ blogId: "b123" });
        expect(jsonErr).to.own.include({ statusCode: 201 });
        done();
      });
    });
  });

  context("GET Blog Unit Test", () => {
    let req = { params: { blogId: "b123" } };
    let selectedBlog = {
      _id: "123",
      title: "title",
      shortContent: "shortContent",
      content: "content",
      // readed: 10,
      created: "2021-11-04",
      updated: "2021-11-05",
      userId: {
        email: "foo@test.com",
        name: "foo",
      },
      save: sandbox.stub().resolves,
    };
    let readBlogStub;
    beforeEach(() => {
      readBlogStub = sandbox.stub().resolves(selectedBlog);
      blogController.__set__("Blog.readBlog", readBlogStub);
    });

    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      blogController = rewire("../controllers/blog");
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      readBlogStub = sandbox.stub().throws(new Error("fake readVBlog error"));
      blogController.__set__("Blog.readBlog", readBlogStub);

      blogController.getBlog(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("fake readVBlog error");
        done();
      });
    });

    it("should throw an error if there is not any matched blog.", (done) => {
      readBlogStub = sandbox.stub().resolves(false);
      blogController.__set__("Blog.readBlog", readBlogStub);

      blogController.getBlog(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Blog could not find!");
        done();
      });
    });

    it("should be ok without readed", (done) => {
      blogController.getBlog(req, res, (err) => {
        expect(err).to.instanceOf(Error);
        const jsonRes = JSON.parse(err.message);
        expect(jsonRes).to.have.property("message");
        expect(jsonRes).to.have.property("statusCode");
        expect(jsonRes)
          .to.have.property("blog")
          .that.includes.all.keys([
            "blogId",
            "title",
            "shortContent",
            "content",
            "readed",
          ]);
        expect(jsonRes.blog)
          .to.have.property("author")
          .that.includes.all.keys(["email", "name"]);
        done();
      });
    });

    it("should be ok with readed", (done) => {
      newSelectedBlog = { ...selectedBlog, readed: 10 };
      readBlogStub = sandbox.stub().resolves(newSelectedBlog);
      blogController.__set__("Blog.readBlog", readBlogStub);

      blogController.getBlog(req, res, (err) => {
        expect(err).to.instanceOf(Error);
        const jsonRes = JSON.parse(err.message);
        expect(jsonRes).to.have.property("message");
        expect(jsonRes).to.have.property("statusCode");
        expect(jsonRes)
          .to.have.property("blog")
          .that.includes.all.keys([
            "blogId",
            "title",
            "shortContent",
            "content",
            "readed",
          ]);
        expect(jsonRes.blog)
          .to.have.property("author")
          .that.includes.all.keys(["email", "name"]);
        done();
      });
    });
  });

  context("PATCH Blog Unit Test", () => {
    let req;
    let selectedBlog, populateStub, findOneStub;
    beforeEach(() => {
      req = {
        userId: "123",
        params: { blogId: "b123" },
        body: {
          title: "new title",
          shortContent: "new shortContent",
          content: "new content",
        },
      };
    });

    selectedBlog = {
      title: "title",
      shortContent: "shortContent",
      content: "content",
      save: sandbox.stub().resolves,
    };
    populateStub = sandbox.stub().resolves(selectedBlog);
    findOneStub = sandbox.stub().returns({ populate: populateStub });
    blogController.__set__("Blog.findOne", findOneStub);

    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      blogController = rewire("../controllers/blog");
    });

    it("should throw an error if there is not any blog change parameters (body part)", (done) => {
      req = {
        userId: "123",
        params: { blogId: "b123" },
        body: {},
      };

      blogController.patchBlog(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("There is nothing to change!");
        done();
      });
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      findOneStub = sandbox.stub().throws(new Error("fake blogFind error"));
      blogController.__set__("Blog.findOne", findOneStub);

      blogController.patchBlog(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("fake blogFind error");
        done();
      });
    });

    it("should throw an error if there is not any matched blog.", (done) => {
      populateStub = sandbox.stub().resolves(false);
      findOneStub = sandbox.stub().returns({ populate: populateStub });
      blogController.__set__("Blog.findOne", findOneStub);

      blogController.patchBlog(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Blog could not find!");
        done();
      });
    });

    it("should be ok!", (done) => {
      populateStub = sandbox.stub().resolves(selectedBlog);
      findOneStub = sandbox.stub().returns({ populate: populateStub });
      blogController.__set__("Blog.findOne", findOneStub);

      blogController.patchBlog(req, res, (err) => {
        expect(err).to.instanceOf(Error);
        const jsonErr = JSON.parse(err.message);
        expect(jsonErr).to.own.include({ message: "Blog Edited!" });
        expect(jsonErr).to.own.include({ blogId: "b123" });
        expect(jsonErr).to.own.include({ statusCode: 201 });
        done();
      });
    });
  });

  context("DELETE Blog Unit Test", () => {
    let req;
    let deleteOneStub;
    beforeEach(() => {
      req = { userId: "123", params: { blogId: "b123" } };
      deleteOneStub = sandbox.stub().resolves(true);
      blogController.__set__("Blog.deleteOne", deleteOneStub);
    });

    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
      blogController = rewire("../controllers/blog");
    });

    it("should throw an error if there is any error about mongoose or mongodb.", (done) => {
      deleteOneStub = sandbox.stub().throws(new Error("fake deleteOne error"));
      blogController.__set__("Blog.deleteOne", deleteOneStub);

      blogController.deleteBlog(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("fake deleteOne error");
        done();
      });
    });

    it("should throw an error if there is not any matched blog.", (done) => {
      deleteOneStub = sandbox.stub().resolves(false);
      blogController.__set__("Blog.deleteOne", deleteOneStub);

      blogController.deleteBlog(req, {}, (err) => {
        expect(err).to.instanceOf(Error);
        expect(err.message).equal("Invalid Authentication!");
        done();
      });
    });

    it("should be ok!", (done) => {
      blogController.deleteBlog(req, res, (err) => {
        expect(err).to.instanceOf(Error);
        const jsonErr = JSON.parse(err.message);
        expect(jsonErr).to.own.include({ message: "Blog Deleted!" });
        expect(jsonErr).to.own.include({ blogId: "b123" });
        expect(jsonErr).to.own.include({ statusCode: 200 });
        done();
      });
    });
  });
});
