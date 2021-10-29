const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/mongoose/user");

exports.postRegister = async (req, res, next) => {
  const { email, name, password: pswd } = req.body;

  try {
    const password = await bcrypt.hash(pswd, 12);

    const masterUser = new User({
      email,
      name,
      password,
    });
    await masterUser.save();

    const token = jwt.sign(
      {
        userId: masterUser._id.toString(),
        email: masterUser.email,
        name: masterUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const sendPack = {
      email: masterUser.email,
      name: masterUser.name,
      token,
    };

    res.status(201).json({ message: "User Created!", master: sendPack });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const masterUser = await User.findOne({ email });
    if (!masterUser) {
      const error = new Error("This user could not find!");
      error.statusCode = 401;
      throw error;
    }

    const isEquel = await bcrypt.compare(password, masterUser.password);
    if (!isEquel) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: masterUser._id.toString(),
        email: masterUser.email,
        name: masterUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const sendPack = {
      email: masterUser.email,
      name: masterUser.name,
      token,
    };

    res.status(201).json({ message: "Login User", master: sendPack });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.patchUpdate = async (req, res, next) => {
  const { newMail, newName } = req.body;
  const userId = req.userId;

  try {
    if (!newMail && !newName) {
      const error = new Error("There is nothing to change!");
      error.statusCode = 404;
      throw error;
    }

    const masterUser = await User.findOne({ _id: userId });
    if (!masterUser) {
      const error = new Error("Invalid Authentication!");
      error.statusCode = 401;
      throw error;
    }

    if (newMail) {
      masterUser.email = newMail;
    }
    if (newName) {
      masterUser.name = newName;
    }
    await masterUser.save();

    const sendPack = {
      email: masterUser.email,
      name: masterUser.name,
    };

    res.status(200).json({ message: "Updated User Info", master: sendPack });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putPassword = async (req, res, next) => {
  const { newPassword: pswd } = req.body;
  const userId = req.userId;

  try {
    const masterUser = await User.findOne({ _id: userId });
    if (!masterUser) {
      const error = new Error("Invalid Authentication!");
      error.statusCode = 401;
      throw error;
    }

    const password = await bcrypt.hash(pswd, 12);
    masterUser.password = password;
    await masterUser.save();

    const sendPack = {
      email: masterUser.email,
      name: masterUser.name,
    };

    res
      .status(200)
      .json({ message: "Password Successfully Changed!", master: sendPack });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.userId;
  const email = req.userEmail;

  try {
    const masterUser = await User.findOne({ _id: userId });
    if (!masterUser) {
      const error = new Error("Invalid Authentication!");
      error.statusCode = 401;
      throw error;
    }
    const _id = masterUser._id.toString();
    await masterUser.deleteOne({ _id });

    res.status(200).json({ message: "User Deleted!", email });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
