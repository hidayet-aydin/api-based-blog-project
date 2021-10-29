exports.postRegister = async (req, res, next) => {
  res.status(200).json({ message: "Create User" });
};

exports.postLogin = async (req, res, next) => {
  res.status(200).json({ message: "Login User" });
};

exports.patchRefreshKey = async (req, res, next) => {
  res.status(200).json({ message: "Refresh Key" });
};

exports.patchUpdate = async (req, res, next) => {
  res.status(200).json({ message: "Update User" });
};

exports.putPassword = async (req, res, next) => {
  res.status(200).json({ message: "New Password" });
};

exports.deleteUser = async (req, res, next) => {
  res.status(200).json({ message: "Delete User" });
};
