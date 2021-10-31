const mongoose = require("mongoose");

exports.initDatabase = async (app) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB is connected!");
    const server = app.listen(process.env.PORT, () => {
      console.log("Server is running...");
    });
    return server;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
