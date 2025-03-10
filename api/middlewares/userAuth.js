const jwt = require("jsonwebtoken");
require("dotenv").config();

const userAuth = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};

module.exports = userAuth;
