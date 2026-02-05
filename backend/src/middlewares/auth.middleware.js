const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json(new ApiResponse(401, null, 'Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json(new ApiResponse(401, null, 'Invalid token. User not found.'));
    }

    if (!user.isActive) {
      return res.status(401).json(new ApiResponse(401, null, 'Account is deactivated.'));
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, null, 'Invalid token.'));
  }
});

module.exports = protect;
module.exports.protect = protect;